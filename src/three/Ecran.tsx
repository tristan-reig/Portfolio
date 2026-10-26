import { useEffect } from 'react'
import { CanvasTexture, Mesh, MeshBasicMaterial, SRGBColorSpace, type Material } from 'three'
import { useThree } from '@react-three/fiber'
import { ECRAN, MODELE } from '../config/scene'
import { useModele } from './modele'

// Remplace le matériau de la dalle par un dégradé vertical
export default function Ecran() {
  const { scene } = useModele()
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    const dalle = scene.getObjectByName(ECRAN.objet)
    if (!dalle) {
      console.warn(`Objet "${ECRAN.objet}" introuvable dans ${MODELE}`)
      return
    }

    const texture = creerDegrade(ECRAN.haut, ECRAN.bas)
    const materiau = new MeshBasicMaterial({ map: texture, toneMapped: false })

    const origines = new Map<Mesh, Material | Material[]>()
    dalle.traverse((o) => {
      if (o instanceof Mesh) {
        origines.set(o, o.material)
        o.material = materiau
      }
    })
    invalidate()

    return () => {
      origines.forEach((m, mesh) => (mesh.material = m))
      texture.dispose()
      materiau.dispose()
    }
  }, [scene, invalidate])

  return null
}

function creerDegrade(haut: string, bas: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 256

  const ctx = canvas.getContext('2d')!
  const degrade = ctx.createLinearGradient(0, 0, 0, canvas.height)
  degrade.addColorStop(0, haut)
  degrade.addColorStop(1, bas)
  ctx.fillStyle = degrade
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.flipY = false
  return texture
}
