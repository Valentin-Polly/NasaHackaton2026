import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { DepthOfField, EffectComposer } from '@react-three/postprocessing'
import { SRGBColorSpace, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import EarthMarker from './EarthMarker.tsx'
import MissionPanel from './MissionPanel'
import { missionSequence } from './mission-sequence'
import './App.css'

type CameraFocusTarget = {
  position: [number, number, number]
  distance: number
  minDistance: number
}

const SUN_POSITION: [number, number, number] = [-12, 5, -14]
const EARTH_RADIUS = 1.5

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
      position={[7.5, 0, 0]}
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
      <sphereGeometry args={[0.375, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  )
}

function Sun({ onSelect, onHoverChange }: BodyInteractionProps) {
  const texture = useTexture('/euvi_aia304_2012_carrington_print.jpg')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh
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
      <sphereGeometry args={[7.5, 64, 64]} />
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
  const mission = missionSequence[0]

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
            onSelect={() => setCameraFocus({ position: [0, 0, 0], distance: 5.6, minDistance: 2 })}
            onHoverChange={setHoveringBody}
          />
          <EarthMarker
            latitude={38.9072}
            longitude={-77.0369}
            radius={EARTH_RADIUS}
          />
          <Moon
            onSelect={() => setCameraFocus({ position: [7.5, 0, 0], distance: 3, minDistance: 2 })}
            onHoverChange={setHoveringBody}
          />
          <Sun
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

      {started && <MissionPanel mission={mission} />}

      {started && <p className="scene-hint">Arrastra para girar</p>}
    </main>
  )
}

export default App
