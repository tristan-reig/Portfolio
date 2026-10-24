import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, ContactShadows, Bvh } from '@react-three/drei'
import { EffectComposer, Outline, Vignette } from '@react-three/postprocessing'
import { Perf } from 'r3f-perf'

const PIECES_CHAISE = ['Accoudoirs', 'Assise', 'Dossier', 'Pietement', 'Roulettes', 'Verin', 'Chaise']

function estChaise(o: THREE.Object3D | null) {
  for (let p = o; p; p = p.parent) {
    if (PIECES_CHAISE.includes(p.name)) return true
  }
  return false
}

function Scene() {
  const { scene } = useGLTF('/models/scene.glb')
  const [survol, setSurvol] = useState(false)

  const chaise = useMemo(() => {
    const meshes: THREE.Mesh[] = []
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh && estChaise(o)) meshes.push(o)
    })
    return meshes
  }, [scene])

  useEffect(() => {
    document.body.style.cursor = survol ? 'pointer' : 'auto'
  }, [survol])

  return (
    <>
      <Bvh firstHitOnly>
        <primitive
          object={scene}
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            setSurvol(estChaise(e.object))
          }}
          onPointerOut={() => setSurvol(false)}
        />
      </Bvh>
      <EffectComposer autoClear={false} multisampling={4}>
        <Outline
          selection={survol ? chaise : []}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0xffffff}
          edgeStrength={4}
          xRay={false}
        />
        <Vignette offset={0.3} darkness={0.45} />
      </EffectComposer>
    </>
  )
}

export default function App() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [2.0, 1.85, -3.05], fov: 35 }}>
      {import.meta.env.DEV && <Perf position="top-left" />}
      <color attach="background" args={['#e4e4e8']} />
      <Environment preset="city" />
      <Scene />
      <ContactShadows frames={1} position={[0, 0, 0]} scale={6} blur={2.5} far={2} opacity={0.5} />
      <OrbitControls
        target={[0, 0.75, 0]}
        enablePan={false}
        minDistance={2.5}
        maxDistance={5.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
      />
    </Canvas>
  )
}

useGLTF.preload('/models/scene.glb')
