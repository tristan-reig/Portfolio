import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'

function Scene() {
  const { scene } = useGLTF('/models/scene.glb')
  return <primitive object={scene} />
}

export default function App() {
  return (
    <Canvas camera={{ position: [2.5, 1.8, 2.5], fov: 45 }}>
      <Environment preset="city" />
      <Scene />
      <OrbitControls target={[0, 0.6, 0]} />
    </Canvas>
  )
}

useGLTF.preload('/models/scene.glb')
