import { useEffect, useMemo, useRef } from 'react'
import { Box3, DoubleSide, Mesh, ShaderMaterial, Vector3, type Material } from 'three'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { ECRAN, MODELE } from '../config/scene'
import { useModele } from './modele'

type Props = {
  // L'OS reçoit la souris
  actif: boolean
}

const METRE_PAR_PIXEL = 10 / 400

export default function Ecran({ actif }: Props) {
  const { scene } = useModele()
  const invalidate = useThree((s) => s.invalidate)
  const iframe = useRef<HTMLIFrameElement>(null)

  const dalle = useMemo(() => {
    const objet = scene.getObjectByName(ECRAN.objet)
    if (!objet) return null
    const boite = new Box3().setFromObject(objet)
    const taille = boite.getSize(new Vector3())
    const centre = boite.getCenter(new Vector3())
    return { objet, largeur: taille.x, hauteur: taille.y, centre, avant: boite.min.z }
  }, [scene])

  useEffect(() => {
    if (!dalle) {
      console.warn(`Objet "${ECRAN.objet}" introuvable dans ${MODELE}`)
      return
    }
    const trou = new ShaderMaterial({
      fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }',
      side: DoubleSide,
    })
    const origines = new Map<Mesh, Material | Material[]>()
    dalle.objet.traverse((o) => {
      if (o instanceof Mesh) {
        origines.set(o, o.material)
        o.material = trou
      }
    })
    invalidate()

    return () => {
      origines.forEach((m, mesh) => (mesh.material = m))
      trou.dispose()
    }
  }, [dalle, invalidate])

  useEffect(() => {
    const surMessage = (e: MessageEvent) => {
      if (e.source !== iframe.current?.contentWindow || e.data?.type !== 'touche') return
      window.dispatchEvent(new KeyboardEvent('keydown', { key: e.data.key }))
    }
    window.addEventListener('message', surMessage)
    return () => window.removeEventListener('message', surMessage)
  }, [])

  if (!dalle) return null

  const largeurPx = ECRAN.largeurPx
  const hauteurPx = Math.round((largeurPx * dalle.hauteur) / dalle.largeur)

  return (
    <Html
      transform
      occlude="blending"
      position={[dalle.centre.x, dalle.centre.y, dalle.avant - 0.001]}
      rotation-y={Math.PI}
      scale={dalle.largeur / (largeurPx * METRE_PAR_PIXEL)}
      pointerEvents={actif ? 'auto' : 'none'}
    >
      <iframe
        ref={iframe}
        src={ECRAN.os}
        title="OS"
        allow="autoplay; encrypted-media; picture-in-picture"
        onLoad={() => invalidate()}
        style={{ width: largeurPx, height: hauteurPx, border: 0, display: 'block', background: '#000' }}
      />
    </Html>
  )
}
