import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, ContactShadows } from '@react-three/drei'

function Scene() {
  const { scene } = useGLTF('/models/scene.glb')
  return <primitive object={scene} />
}

export default function App() {
  return (
    <Canvas camera={{ position: [4, 3, 4], fov: 30 }} gl={{ alpha: true }}>
      <Environment preset="city" />
      <Scene />
      <ContactShadows position={[0, 0, 0]} scale={6} blur={2.5} far={2} opacity={0.5} />
      <OrbitControls
        target={[0, 0.6, 0]}
        enablePan={false}
        minDistance={3}
        maxDistance={7}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
      />
    </Canvas>
  )
}

useGLTF.preload('/models/scene.glb')
