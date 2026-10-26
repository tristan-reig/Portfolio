import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import Ambiance from './three/Ambiance'
import CameraRig from './three/CameraRig'
import Scene from './three/Scene'
import Chargement from './ui/Chargement'
import Hud from './ui/Hud'
import { debloquerSon } from './audio/clavier'
import { useNavigation } from './hooks/useNavigation'
import { usePremiereInteraction } from './hooks/usePremiereInteraction'
import { useTouche } from './hooks/useTouche'
import { VUE_ENSEMBLE } from './config/scene'

export default function App() {
  const [demarre, setDemarre] = useState(false)
  const { vue, verrou, aller, retour, basculerVerrou } = useNavigation()

  const surChaise = useCallback(() => aller('ecran'), [aller])
  const surEcran = useCallback(() => aller('zoom'), [aller])

  usePremiereInteraction(() => {
    debloquerSon()
    setDemarre(true)
  })
  useTouche('Escape', retour)

  return (
    <>
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: VUE_ENSEMBLE.position, fov: 35 }}
        style={{ isolation: 'isolate' }}
      >
        {import.meta.env.DEV && <Perf position="bottom-right" />}
        {/* Pendant le chargement, seule la scène attend : le Canvas et le reste de la page continuent de vivre */}
        <Suspense fallback={null}>
          <Ambiance />
          <Scene vue={vue} onChaise={surChaise} onEcran={surEcran} />
          <CameraRig vue={vue} verrou={verrou} />
        </Suspense>
      </Canvas>
      <Hud actif={demarre} focus={vue !== 'ensemble'} verrou={verrou} onRetour={retour} onCamera={basculerVerrou} />
      <Chargement />
    </>
  )
}
