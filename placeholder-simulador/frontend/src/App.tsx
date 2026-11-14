import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { DepthOfField, EffectComposer } from '@react-three/postprocessing'
import { SRGBColorSpace } from 'three'
import './App.css'

function Skybox() {
  const { scene } = useGLTF('/billions_stars_skybox_hdri_panorama.glb')
  return <primitive object={scene} scale={100} />
}

function Earth() {
  const texture = useTexture('/earth-blue-marble.png')
  texture.colorSpace = SRGBColorSpace

  return (
    <mesh>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function App() {
  const [started, setStarted] = useState(false)

  return (
    <main className="scene">
      <div
        className={`simulator ${started ? 'simulator--ready' : 'simulator--preview'}`}
        aria-hidden={!started}
      >
        <Canvas camera={{ position: [3, 2.5, 4], fov: 45 }}>
          <EffectComposer>
            {/* Cambia acá el enfoque, rango y fuerza del bokeh. */}
            <DepthOfField
              target={[0, 0, 0]}
              focusRange={20}
              bokehScale={2}
            />
          </EffectComposer>
          <color attach="background" args={['#10131a']} />
          <Skybox />
          <ambientLight intensity={1.5} />
          <directionalLight position={[4, 5, 3]} intensity={3} />
          <Earth />
          <OrbitControls enablePan={false} enableZoom={false} />
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

      {started && <p className="scene-hint">Arrastra para girar</p>}
    </main>
  )
}

export default App
