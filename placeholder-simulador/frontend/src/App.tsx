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
  return (
    <main className="scene">
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
      <p className="scene-hint">Arrastra para girar</p>
    </main>
  )
}

export default App
