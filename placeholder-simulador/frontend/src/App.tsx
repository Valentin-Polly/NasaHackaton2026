import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { DepthOfField, EffectComposer } from '@react-three/postprocessing'
import { SRGBColorSpace, Vector3 } from 'three'
import type { Mesh } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import CelestialMarker from './CelestialMarker'
import type { CelestialMarkerLocation } from './celestial-marker-types'
import { CelestialMarkerIcon, EarthMarkerIcon } from './mission-marker-icons'
import TrajectoryPath from './TrajectoryPath'
import MissionPanel from './MissionPanel'
import MissionQuiz from './MissionQuiz'
import ArtemisSitesPanel from './ArtemisSitesPanel'
import { artemisSites } from './artemis-site-data'
import type { ArtemisSite } from './artemis-site-data'
import PhotoGallery from './PhotoGallery'
import type { PhotoGalleryData } from './gallery-data'
import { missionSequence } from './mission-sequence'
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
const EARTH_CAMERA_FOCUS: CameraFocusTarget = {
  position: EARTH_POSITION,
  distance: 5.6,
  minDistance: 2,
}
const MOON_CAMERA_FOCUS: CameraFocusTarget = {
  position: MOON_POSITION,
  distance: 3,
  minDistance: 2,
}
const CELESTIAL_BODY_SURFACES: Record<
  CelestialMarkerLocation['body'],
  { center: Position; radius: number }
> = {
  earth: { center: EARTH_POSITION, radius: EARTH_RADIUS },
  moon: { center: MOON_POSITION, radius: MOON_RADIUS },
  sun: { center: SUN_POSITION, radius: SUN_RADIUS },
}

function Skybox() {
  const { scene } = useGLTF('/billions_stars_skybox_hdri_panorama.glb')
  return <primitive object={scene} scale={100} />
}

type BodyInteractionProps = {
  onSelect: () => void
  onHoverChange: (hovering: boolean) => void
  meshRef: RefObject<Mesh>
}

function Earth({ onSelect, onHoverChange, meshRef }: BodyInteractionProps) {
  const texture = useTexture('/earth-blue-marble.png')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
      ref={meshRef}
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

function Moon({ onSelect, onHoverChange, meshRef }: BodyInteractionProps) {
  const texture = useTexture('/lroc_color_2k.jpg')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
      ref={meshRef}
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

function Sun({ meshRef }: { meshRef: RefObject<Mesh> }) {
  const texture = useTexture('/euvi_aia304_2012_carrington_print.jpg')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh ref={meshRef} position={SUN_POSITION}>
      <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function SceneControls({
  focus,
  allowLunarSurfaceZoom = false,
}: {
  focus: CameraFocusTarget | null
  allowLunarSurfaceZoom?: boolean
}) {
  const controls = useRef<OrbitControlsImpl | null>(null)
  const { camera } = useThree()
  const destinationPosition = useRef(new Vector3())
  const transitioning = useRef(false)
  const isMoonFocused = focus?.position.every(
    (coordinate, index) => coordinate === MOON_POSITION[index],
  ) ?? false
  const minDistance =
    allowLunarSurfaceZoom && isMoonFocused
      ? MOON_RADIUS + 0.1
      : focus?.minDistance ?? 2

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
      minDistance={minDistance}
      maxDistance={40}
      onStart={() => {
        transitioning.current = false
      }}
    />
  )
}

function App() {
  const [started, setStarted] = useState(false)
  const [showControlsHint, setShowControlsHint] = useState(true)
  const [cameraFocus, setCameraFocus] = useState<CameraFocusTarget | null>(null)
  const [hoveringBody, setHoveringBody] = useState(false)
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activeGallery, setActiveGallery] = useState<PhotoGalleryData | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  const [artemisSitesOpen, setArtemisSitesOpen] = useState(false)
  const [selectedArtemisSite, setSelectedArtemisSite] = useState<ArtemisSite>(artemisSites[0])
  const earthMeshRef = useRef<Mesh>(null!)
  const moonMeshRef = useRef<Mesh>(null!)
  const sunMeshRef = useRef<Mesh>(null!)
  const mission = missionSequence[currentMissionIndex]
  const hasPreviousMission = currentMissionIndex > 0
  const hasNextMission = currentMissionIndex < missionSequence.length - 1
  const activeStep = mission.steps[currentStepIndex]
  const activeMarker = activeStep.marker
  const markerSurface = activeMarker
    ? CELESTIAL_BODY_SURFACES[activeMarker.location.body]
    : null
  const markerOccluders = activeMarker
    ? activeMarker.location.body === 'earth'
      ? [moonMeshRef, sunMeshRef]
      : activeMarker.location.body === 'moon'
        ? [earthMeshRef, sunMeshRef]
        : [earthMeshRef, moonMeshRef]
    : []

  const focusCameraOn = (target: CameraFocusTarget) => {
    const focusedPosition = cameraFocus?.position ?? EARTH_POSITION
    if (focusedPosition.every((coordinate, index) => coordinate === target.position[index])) {
      return
    }

    setCameraFocus(target)
  }

  const focusForStep = (index: number) => {
    if (index === 0) {
      focusCameraOn(EARTH_CAMERA_FOCUS)
    } else if (index === 2) {
      focusCameraOn(MOON_CAMERA_FOCUS)
    }
  }

  const handleStartExploration = () => {
    setStarted(true)
    focusForStep(0)
  }

  const handleStepChange = (index: number) => {
    focusForStep(index)
    setCurrentStepIndex(index)
    setActiveGallery(null)
  }

  const handleNextMission = () => {
    if (!hasNextMission) return
    setCurrentMissionIndex((index) => index + 1)
    setCurrentStepIndex(0)
    focusForStep(0)
    setActiveGallery(null)
  }

  const handlePreviousMission = () => {
    if (!hasPreviousMission) return
    const previousMissionIndex = currentMissionIndex - 1
    const previousStepIndex = missionSequence[previousMissionIndex].steps.length - 1
    setCurrentMissionIndex(previousMissionIndex)
    setCurrentStepIndex(previousStepIndex)
    focusForStep(previousStepIndex)
    setActiveGallery(null)
  }

  const handleCompleteMissions = () => {
    setActiveGallery(null)
    setQuizOpen(true)
  }

  const handleOpenArtemisSites = () => {
    setActiveGallery(null)
    setQuizOpen(false)
    setShowControlsHint(false)
    setSelectedArtemisSite(artemisSites[0])
    setArtemisSitesOpen(true)
  }

  const handleSelectArtemisSite = (site: ArtemisSite) => {
    setSelectedArtemisSite(site)
  }

  const handleReturnToStart = () => {
    setStarted(false)
    setShowControlsHint(true)
    setCameraFocus({ ...EARTH_CAMERA_FOCUS })
    setHoveringBody(false)
    setCurrentMissionIndex(0)
    setCurrentStepIndex(0)
    setActiveGallery(null)
    setQuizOpen(false)
    setArtemisSitesOpen(false)
    setSelectedArtemisSite(artemisSites[0])
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
          <pointLight position={SUN_POSITION} color="#fff1d6" intensity={500} decay={2} />
          <Earth
            meshRef={earthMeshRef}
            onSelect={() => focusCameraOn(EARTH_CAMERA_FOCUS)}
            onHoverChange={setHoveringBody}
          />
          {started && activeStep.trajectory && (
            <TrajectoryPath trajectory={activeStep.trajectory} surfaces={CELESTIAL_BODY_SURFACES} />
          )}
          {started && !artemisSitesOpen && activeMarker && markerSurface && (
            <CelestialMarker
              {...activeMarker.location}
              center={markerSurface.center}
              radius={markerSurface.radius}
              label={activeMarker.label}
              occluders={markerOccluders}
              onActivate={() => setActiveGallery(activeMarker.gallery)}
            />
          )}
          {started && artemisSitesOpen && artemisSites.map((site) => (
            <CelestialMarker
              key={site.site_id}
              body="moon"
              coordinates={{
                selenographicLatitude: site.center_lat_deg,
                selenographicLongitude: site.center_lon_deg,
              }}
              center={MOON_POSITION}
              radius={MOON_RADIUS}
              label={`Seleccionar ${site.site_id}: ${site.name}`}
              active={site.site_id === selectedArtemisSite.site_id}
              occluders={[earthMeshRef, sunMeshRef]}
              onActivate={() => handleSelectArtemisSite(site)}
            />
          ))}
          <Moon
            meshRef={moonMeshRef}
            onSelect={() => focusCameraOn(MOON_CAMERA_FOCUS)}
            onHoverChange={setHoveringBody}
          />
          <Sun meshRef={sunMeshRef} />
          <SceneControls focus={cameraFocus} allowLunarSurfaceZoom={artemisSitesOpen} />
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
              onClick={handleStartExploration}
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

      {started && !artemisSitesOpen && (
        <MissionPanel
          mission={mission}
          currentStepIndex={currentStepIndex}
          onStepChange={handleStepChange}
          onPreviousMission={handlePreviousMission}
          onNextMission={handleNextMission}
          onCompleteMissions={handleCompleteMissions}
          hasPreviousMission={hasPreviousMission}
          hasNextMission={hasNextMission}
        />
      )}

      {started && artemisSitesOpen && (
        <ArtemisSitesPanel
          selectedSite={selectedArtemisSite}
          onSelectSite={handleSelectArtemisSite}
          onReturnToStart={handleReturnToStart}
        />
      )}

      {started && !artemisSitesOpen && showControlsHint && (
        <aside className="controls-hint" aria-labelledby="controls-hint-title">
          <div className="controls-hint-heading">
            <div>
              <p className="controls-hint-eyebrow">INICIO DE EXPLORACIÓN</p>
              <h2 id="controls-hint-title">Cómo navegar</h2>
            </div>
            <button
              className="controls-hint-close"
              type="button"
              aria-label="Cerrar instrucciones de navegación"
              onClick={() => setShowControlsHint(false)}
            >
              ×
            </button>
          </div>
          <ul className="controls-hint-list">
            <li><strong>Explorar:</strong> arrastra con el mouse para girar y usa la rueda para acercar o alejar.</li>
            <li><strong>Enfocar:</strong> haz clic en un planeta para centrar la vista en él.</li>
            <li>
              <strong>Ver imágenes:</strong> haz clic en los marcadores
              <span className="controls-hint-marker-icons" aria-hidden="true">
                <EarthMarkerIcon size={14} strokeWidth={1.8} />
                <CelestialMarkerIcon size={14} strokeWidth={1.8} />
              </span>
              ; las imágenes disponibles corresponden al paso activo.
            </li>
          </ul>
        </aside>
      )}

      {activeGallery && (
        <PhotoGallery
          key={activeGallery.title}
          gallery={activeGallery}
          onClose={() => setActiveGallery(null)}
        />
      )}

      {started && quizOpen && <MissionQuiz onOpenArtemis={handleOpenArtemisSites} />}

      {started && <p className="scene-hint">Arrastra para girar</p>}
    </main>
  )
}

export default App
