import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import Ambiance from './three/Ambiance'
import CameraRig from './three/CameraRig'
import Scene from './three/Scene'
import BoutonRetour from './ui/BoutonRetour'
import { useTouche } from './hooks/useTouche'
import { VUE_ENSEMBLE } from './config/scene'

export default function App() {
  // focus : la caméra est devant l'écran
  const [focus, setFocus] = useState(false)
  const entrer = useCallback(() => setFocus(true), [])
  const quitter = useCallback(() => setFocus(false), [])

  useTouche('Escape', quitter)

  return (
    <>
      <Canvas dpr={[1, 1.5]} frameloop={import.meta.env.DEV ? "always" : "demand"} camera={{ position: VUE_ENSEMBLE.position, fov: 35 }}>
        {import.meta.env.DEV && <Perf position="bottom-right" />}
        <Ambiance />
        <Scene focus={focus} onChaise={entrer} />
        <CameraRig focus={focus} />
      </Canvas>
      {focus && <BoutonRetour onClick={quitter} />}
    </>
  )
}
