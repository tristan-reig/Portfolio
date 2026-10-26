import { useEffect, useMemo, useState } from 'react'
import { Mesh } from 'three'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Bvh } from '@react-three/drei'
import Ecran from './Ecran'
import Effets from './Effets'
import { type VueId } from '../config/scene'
import { estChaise } from '../utils/chaise'
import { estEcran } from '../utils/ecran'
import { useModele } from './modele'

type Props = {
  vue: VueId
  onChaise: () => void
  onEcran: () => void
}

type Survol = 'chaise' | 'ecran' | null

export default function Scene({ vue, onChaise, onEcran }: Props) {
  const { scene } = useModele()
  const [survol, setSurvol] = useState<Survol>(null)
  const invalidate = useThree((s) => s.invalidate)

  // La chaise n'est cliquable qu'en vue d'ensemble, l'écran tant qu'on n'a pas zoomé dessus
  const chaiseActive = survol === 'chaise' && vue === 'ensemble'
  const ecranActif = survol === 'ecran' && vue !== 'zoom'

  const { chaise, ecran } = useMemo(() => {
    const chaise: Mesh[] = []
    const ecran: Mesh[] = []
    scene.traverse((o) => {
      if (!(o instanceof Mesh)) return
      if (estChaise(o)) chaise.push(o)
      else if (estEcran(o)) ecran.push(o)
    })
    return { chaise, ecran }
  }, [scene])

  // Contour blanc sur l'objet survolé, s'il est cliquable
  const contour = useMemo(
    () => (chaiseActive ? chaise : ecranActif ? ecran : []),
    [chaiseActive, ecranActif, chaise, ecran],
  )

  useEffect(() => {
    document.body.style.cursor = chaiseActive || ecranActif ? 'pointer' : 'auto'
    invalidate()
  }, [chaiseActive, ecranActif, invalidate])

  const surMouvement = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setSurvol(estChaise(e.object) ? 'chaise' : estEcran(e.object) ? 'ecran' : null)
  }

  const surClic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta >= 5) return
    if (vue === 'ensemble' && estChaise(e.object)) onChaise()
    else if (vue !== 'zoom' && estEcran(e.object)) onEcran()
  }

  return (
    <>
      <Bvh firstHitOnly>
        <primitive
          object={scene}
          onPointerMove={surMouvement}
          onPointerOut={() => setSurvol(null)}
          onClick={surClic}
        />
      </Bvh>
      <Ecran />
      <Effets contour={contour} />
    </>
  )
}
