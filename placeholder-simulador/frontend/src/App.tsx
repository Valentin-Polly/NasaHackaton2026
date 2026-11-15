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
import TrajectoryPath from './TrajectoryPath'
import MissionPanel from './MissionPanel'
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

function Sun({ onSelect, onHoverChange, meshRef }: BodyInteractionProps) {
  const texture = useTexture('/euvi_aia304_2012_carrington_print.jpg')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
      ref={meshRef}
      position={SUN_POSITION}
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
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [activeGallery, setActiveGallery] = useState<PhotoGalleryData | null>(null)
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

  const handleStepChange = (index: number) => {
    setCurrentStepIndex(index)
    setActiveGallery(null)
  }

  const handleNextMission = () => {
    if (!hasNextMission) return
    setCurrentMissionIndex((index) => index + 1)
    setCurrentStepIndex(0)
    setActiveGallery(null)
  }

  const handlePreviousMission = () => {
    if (!hasPreviousMission) return
    const previousMissionIndex = currentMissionIndex - 1
    setCurrentMissionIndex(previousMissionIndex)
    setCurrentStepIndex(missionSequence[previousMissionIndex].steps.length - 1)
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
          <pointLight position={SUN_POSITION} color="#fff1d6" intensity={500} decay={2} />
          <Earth
            meshRef={earthMeshRef}
            onSelect={() => setCameraFocus({ position: EARTH_POSITION, distance: 5.6, minDistance: 2 })}
            onHoverChange={setHoveringBody}
          />
          {started && activeStep.trajectory && (
            <TrajectoryPath trajectory={activeStep.trajectory} surfaces={CELESTIAL_BODY_SURFACES} />
          )}
          {started && activeMarker && markerSurface && (
            <CelestialMarker
              {...activeMarker.location}
              center={markerSurface.center}
              radius={markerSurface.radius}
              label={activeMarker.label}
              occluders={markerOccluders}
              onActivate={() => setActiveGallery(activeMarker.gallery)}
            />
          )}
          <Moon
            meshRef={moonMeshRef}
            onSelect={() => setCameraFocus({ position: MOON_POSITION, distance: 3, minDistance: 2 })}
            onHoverChange={setHoveringBody}
          />
          <Sun
            meshRef={sunMeshRef}
            onSelect={() => setCameraFocus({ position: SUN_POSITION, distance: 22.5, minDistance: 8 })}
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
          onPreviousMission={handlePreviousMission}
          onNextMission={handleNextMission}
          hasPreviousMission={hasPreviousMission}
          hasNextMission={hasNextMission}
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
