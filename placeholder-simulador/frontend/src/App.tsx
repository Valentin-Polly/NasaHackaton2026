import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { DepthOfField, EffectComposer } from '@react-three/postprocessing'
import { SRGBColorSpace, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import CelestialMarker from './CelestialMarker'
import type { CelestialMarkerLocation } from './celestial-marker-types'
import TrajectoryPath from './TrajectoryPath'
import MissionPanel from './MissionPanel'
import PhotoGallery from './PhotoGallery'
import type { PhotoGalleryData } from './gallery-data'
import { missionSequence } from './mission-sequence'
import { capeCanaveralLocalTimeToUtc, optimizeLunarLanding } from './lunarOptimizer'
import type { Trajectory } from './trajectory-types'
import './App.css'

type Position = [number, number, number]

type CameraFocusTarget = {
  position: [number, number, number]
  distance: number
  minDistance: number
}

const EARTH_POSITION: Position = [0, 0, 0]
const EARTH_RADIUS = 1.5
const MOON_POSITION: Position = [7.5, 0, 0]
const MOON_RADIUS = 0.375
const SUN_POSITION: Position = [-12, 5, -14]
const SUN_RADIUS = 7.5
const CELESTIAL_BODY_SURFACES: Record<
  CelestialMarkerLocation['body'],
  { center: Position; radius: number }
> = {
  earth: { center: EARTH_POSITION, radius: EARTH_RADIUS },
  moon: { center: MOON_POSITION, radius: MOON_RADIUS },
  sun: { center: SUN_POSITION, radius: SUN_RADIUS },
}

function getSunPosition(date: Date): Position {
  const referenceDate = Date.UTC(2027, 0, 1)
  const annualAngle = ((date.getTime() - referenceDate) / (365.25 * 24 * 60 * 60 * 1_000))
    * Math.PI * 2
  const cosine = Math.cos(annualAngle)
  const sine = Math.sin(annualAngle)

  return [
    SUN_POSITION[0] * cosine + SUN_POSITION[2] * sine,
    SUN_POSITION[1],
    -SUN_POSITION[0] * sine + SUN_POSITION[2] * cosine,
  ]
}

function getSurfacePosition(
  center: Position,
  radius: number,
  latitude: number,
  longitude: number,
): Position {
  const latitudeRadians = (latitude * Math.PI) / 180
  const longitudeRadians = (longitude * Math.PI) / 180

  return [
    center[0] + Math.cos(latitudeRadians) * Math.cos(longitudeRadians) * radius * 1.01,
    center[1] + Math.sin(latitudeRadians) * radius * 1.01,
    center[2] - Math.cos(latitudeRadians) * Math.sin(longitudeRadians) * radius * 1.01,
  ]
}

function Skybox() {
  const { scene } = useGLTF('/billions_stars_skybox_hdri_panorama.glb')
  return <primitive object={scene} scale={100} />
}

type BodyInteractionProps = {
  onSelect: () => void
  onHoverChange: (hovering: boolean) => void
}

function Earth({ onSelect, onHoverChange }: BodyInteractionProps) {
  const texture = useTexture('/earth-blue-marble.png')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHoverChange(true)
      }}
      onPointerOut={() => onHoverChange(false)}
    >
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        emissive="#ffffff"
        emissiveMap={texture}
        emissiveIntensity={0.01}
      />
    </mesh>
  )
}

function Moon({ onSelect, onHoverChange }: BodyInteractionProps) {
  const texture = useTexture('/lroc_color_2k.jpg')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
      position={MOON_POSITION}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHoverChange(true)
      }}
      onPointerOut={() => onHoverChange(false)}
    >
      <sphereGeometry args={[MOON_RADIUS, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  )
}

function Sun({
  onSelect,
  onHoverChange,
  position,
}: BodyInteractionProps & { position: Position }) {
  const texture = useTexture('/euvi_aia304_2012_carrington_print.jpg')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        onHoverChange(true)
      }}
      onPointerOut={() => onHoverChange(false)}
    >
      <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function SceneControls({ focus }: { focus: CameraFocusTarget | null }) {
  const controls = useRef<OrbitControlsImpl | null>(null)
  const { camera } = useThree()
  const destinationPosition = useRef(new Vector3())
  const transitioning = useRef(false)

  useEffect(() => {
    const currentControls = controls.current
    if (!focus || !currentControls) return

    const target = new Vector3(...focus.position)
    const direction = camera.position.clone().sub(currentControls.target).normalize()

    destinationPosition.current.copy(target).addScaledVector(direction, focus.distance)
    currentControls.target.copy(target)
    currentControls.update()
    transitioning.current = true
  }, [camera, focus])

  useFrame((_, delta) => {
    const currentControls = controls.current
    if (!currentControls || !transitioning.current) return

    const progress = 1 - Math.exp(-4 * delta)
    camera.position.lerp(destinationPosition.current, progress)
    currentControls.update()

    if (camera.position.distanceToSquared(destinationPosition.current) < 0.001) {
      camera.position.copy(destinationPosition.current)
      currentControls.update()
      transitioning.current = false
    }
  })

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom
      minDistance={focus?.minDistance ?? 2}
      maxDistance={40}
      onStart={() => {
        transitioning.current = false
      }}
    />
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [cameraFocus, setCameraFocus] = useState<CameraFocusTarget | null>(null)
  const [hoveringBody, setHoveringBody] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activeGallery, setActiveGallery] = useState<PhotoGalleryData | null>(null)
  const [launchDateTime, setLaunchDateTime] = useState('2027-01-01T00:00')
  const optimization = useMemo(() => {
    if (!launchDateTime) return null

    const departureDate = capeCanaveralLocalTimeToUtc(launchDateTime)
    if (!departureDate) return null

    return optimizeLunarLanding(departureDate)
  }, [launchDateTime])
  const arrivalDate = optimization
    ? new Date(optimization.optimalSite.optimalLandingUtc)
    : new Date('2027-01-01T00:00:00.000Z')
  const sunPosition = getSunPosition(arrivalDate)
  const mission = missionSequence[0]
  const activeStep = mission.steps[currentStepIndex]
  const activeMarker = activeStep.marker
  const markerSurface = activeMarker
    ? CELESTIAL_BODY_SURFACES[activeMarker.location.body]
    : null
  const dynamicTrajectory = useMemo<Trajectory | null>(() => {
    if (!optimization) return null

    const launchPoint = getSurfacePosition(
      EARTH_POSITION,
      EARTH_RADIUS,
      28.6083,
      -80.6041,
    )
    const landingPoint = getSurfacePosition(
      MOON_POSITION,
      MOON_RADIUS,
      optimization.optimalSite.latitude,
      optimization.optimalSite.longitude,
    )

    return {
      segments: [{
        type: 'curve',
        points: [launchPoint, [3.75, 2.4, 0], landingPoint],
        color: '#c4ff00',
      }],
    }
  }, [optimization])
  const currentMarkerMatchesWinner = activeMarker?.location.body === 'moon'
    && optimization !== null
    && activeMarker.location.coordinates.selenographicLatitude === optimization.optimalSite.latitude
    && activeMarker.location.coordinates.selenographicLongitude === optimization.optimalSite.longitude

  const handleStepChange = (index: number) => {
    setCurrentStepIndex(index)
    setActiveGallery(null)
  }

  return (
    <main className="scene">
      <div
        className={`simulator ${started ? 'simulator--ready' : 'simulator--preview'}${hoveringBody ? ' simulator--body-hover' : ''}`}
        aria-hidden={!started}
      >
        <Canvas
          camera={{ position: [3, 2.5, 4], fov: 45 }}
          frameloop={started ? 'always' : 'demand'}
        >
          <EffectComposer>
            {/* Cambia acá el enfoque, rango y fuerza del bokeh. */}
            <DepthOfField
              target={cameraFocus?.position ?? [0, 0, 0]}
              focusRange={20}
              bokehScale={2}
            />
          </EffectComposer>
          <color attach="background" args={['#10131a']} />
          <Skybox />
          {/* Ajusta estas intensidades: pointLight controla la luz del Sol y ambientLight el brillo de relleno. */}
          <ambientLight intensity={1} />
          <pointLight position={sunPosition} color="#fff1d6" intensity={500} decay={2} />
          <Earth
            onSelect={() => setCameraFocus({ position: EARTH_POSITION, distance: 5.6, minDistance: 2 })}
            onHoverChange={setHoveringBody}
          />
          {started && activeStep.trajectory && (
            <TrajectoryPath trajectory={activeStep.trajectory} surfaces={CELESTIAL_BODY_SURFACES} />
          )}
          {started && dynamicTrajectory && (
            <TrajectoryPath trajectory={dynamicTrajectory} surfaces={CELESTIAL_BODY_SURFACES} />
          )}
          {started && activeMarker && markerSurface && (
            <CelestialMarker
              {...activeMarker.location}
              center={markerSurface.center}
              radius={markerSurface.radius}
              label={activeMarker.label}
              variant={currentMarkerMatchesWinner ? 'winner' : undefined}
              onActivate={() => setActiveGallery(activeMarker.gallery)}
            />
          )}
          {started && optimization?.ranking.slice(0, 6).map((site, index) => {
            const isCurrentMarker = activeMarker?.location.body === 'moon'
              && activeMarker.location.coordinates.selenographicLatitude === site.latitude
              && activeMarker.location.coordinates.selenographicLongitude === site.longitude
            if (isCurrentMarker) return null

            return (
              <CelestialMarker
                key={site.siteId}
                body="moon"
                coordinates={{
                  selenographicLatitude: site.latitude,
                  selenographicLongitude: site.longitude,
                }}
                center={MOON_POSITION}
                radius={MOON_RADIUS}
                label={`${index === 0 ? 'Sitio óptimo' : `Alternativa ${index}`}: ${site.name}`}
                variant={index === 0 ? 'winner' : 'alternative'}
              />
            )
          })}
          <Moon
            onSelect={() => setCameraFocus({ position: MOON_POSITION, distance: 3, minDistance: 2 })}
            onHoverChange={setHoveringBody}
          />
          <Sun
            position={sunPosition}
            onSelect={() => setCameraFocus({ position: sunPosition, distance: 22.5, minDistance: 8 })}
            onHoverChange={setHoveringBody}
          />
          <SceneControls focus={cameraFocus} />
        </Canvas>
      </div>

      {!started && (
        <section className="welcome" aria-labelledby="welcome-title">
          <div className="welcome-orbit welcome-orbit--one" aria-hidden="true" />
          <div className="welcome-orbit welcome-orbit--two" aria-hidden="true" />

          <div className="welcome-card">
            <p className="welcome-eyebrow">
              <span className="welcome-status" />
              SISTEMA SOLAR <span className="welcome-divider">/</span> SIMULADOR 3D
            </p>
            <p className="welcome-index">EXPLORACIÓN INTERACTIVA</p>
            <h1 id="welcome-title">
              PLACEHOLDER
              <span>SIMULADOR :)</span>
            </h1>
            <p className="welcome-description">
              Una experiencia interactiva para explorar nuestro sistema solar.
            </p>
            <button
              className="launch-button"
              type="button"
              onClick={() => setStarted(true)}
            >
              <span>Comenzar exploración</span>
              <span className="launch-arrow" aria-hidden="true">→</span>
            </button>
            <div className="welcome-footer">
              <span>3D</span>
              <span>ARRASTRA PARA EXPLORAR</span>
            </div>
          </div>
          <span className="welcome-coordinate" aria-hidden="true">
            31.438° S <span>·</span> 64.193° O
          </span>
        </section>
      )}

      {started && (
        <MissionPanel
          mission={mission}
          currentStepIndex={currentStepIndex}
          onStepChange={handleStepChange}
          launchDateTime={launchDateTime}
          onLaunchDateTimeChange={setLaunchDateTime}
          optimization={optimization}
        />
      )}

      {activeGallery && (
        <PhotoGallery
          key={activeGallery.title}
          gallery={activeGallery}
          onClose={() => setActiveGallery(null)}
        />
      )}

      {started && <p className="scene-hint">Arrastra para girar</p>}
    </main>
  )
}

export default App
