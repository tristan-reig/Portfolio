import { useEffect, useMemo, useState } from 'react'
import { Mesh } from 'three'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { Bvh, useGLTF } from '@react-three/drei'
import Effets from './Effets'
import { MODELE } from '../config/scene'
import { estChaise } from '../utils/chaise'

type Props = {
  focus: boolean
  onChaise: () => void
}

export default function Scene({ focus, onChaise }: Props) {
  const { scene } = useGLTF(MODELE)
  const [survol, setSurvol] = useState(false)
  const invalidate = useThree((s) => s.invalidate)

  // Pas de surbrillance quand la caméra est devant l'écran
  const surbrillance = survol && !focus

  const chaise = useMemo(() => {
    const meshes: Mesh[] = []
    scene.traverse((o) => {
      if (o instanceof Mesh && estChaise(o)) meshes.push(o)
    })
    return meshes
  }, [scene])

  const contour = useMemo(() => (surbrillance ? chaise : []), [surbrillance, chaise])

  useEffect(() => {
    document.body.style.cursor = surbrillance ? 'pointer' : 'auto'
    invalidate()
  }, [surbrillance, invalidate])

  const surMouvement = (e: ThreeEvent<PointerEvent>) => {
    // Seul l'objet le plus proche du curseur compte
    e.stopPropagation()
    setSurvol(estChaise(e.object))
  }

  const surClic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // e.delta : distance parcourue par la souris, pour ignorer la fin d'une rotation
    if (!focus && e.delta < 5 && estChaise(e.object)) onChaise()
  }

  return (
    <>
      <Bvh firstHitOnly>
        <primitive
          object={scene}
          onPointerMove={surMouvement}
          onPointerOut={() => setSurvol(false)}
          onClick={surClic}
        />
      </Bvh>
      <Effets contour={contour} />
    </>
  )
}

useGLTF.preload(MODELE)
