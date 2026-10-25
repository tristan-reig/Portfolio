import { useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import Ambiance from './three/Ambiance'
import CameraRig from './three/CameraRig'
import Scene from './three/Scene'
import Hud from './ui/Hud'
import { useNavigation } from './hooks/useNavigation'
import { useTouche } from './hooks/useTouche'
import { VUE_ENSEMBLE } from './config/scene'

export default function App() {
  const { vue, verrou, aller, retour, basculerVerrou } = useNavigation()

  const surChaise = useCallback(() => aller('ecran'), [aller])
  const surEcran = useCallback(() => aller('zoom'), [aller])

  useTouche('Escape', retour)

  return (
    <>
      <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: VUE_ENSEMBLE.position, fov: 35 }}>
        {import.meta.env.DEV && <Perf position="bottom-right" />}
        <Ambiance />
        <Scene vue={vue} onChaise={surChaise} onEcran={surEcran} />
        <CameraRig vue={vue} verrou={verrou} />
      </Canvas>
      <Hud focus={vue !== 'ensemble'} verrou={verrou} onRetour={retour} onCamera={basculerVerrou} />
    </>
  )
}
