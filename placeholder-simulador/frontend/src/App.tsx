import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import './App.css'

function Skybox() {
  const { scene } = useGLTF('/billions_stars_skybox_hdri_panorama.glb')

  return <primitive object={scene} scale={100} />
}

function App() {
  return (
    <main className="scene">
      <Canvas camera={{ position: [3, 2.5, 4], fov: 45 }}>
        <color attach="background" args={['#10131a']} />
        <Skybox />
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 5, 3]} intensity={3} />
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.35} />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <p className="scene-hint">Arrastra para girar</p>
    </main>
  )
}

export default App
