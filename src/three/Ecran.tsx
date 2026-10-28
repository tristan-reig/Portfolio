import { useEffect, useMemo, useRef } from 'react'
import { Box3, DoubleSide, Matrix4, Mesh, ShaderMaterial, Vector3, type Material } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { ECRAN, MODELE } from '../config/scene'
import { useModele } from './modele'
import { useVueAtteinte } from './vueAtteinte'

type Props = {
  actif: boolean
}

export default function Ecran({ actif }: Props) {
  const { scene } = useModele()
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const iframe = useRef<HTMLIFrameElement | null>(null)
  const net = useVueAtteinte() === 'zoom'
  const dernier = useRef('')

  const dalle = useMemo(() => {
    const objet = scene.getObjectByName(ECRAN.objet)
    if (!objet) return null
    const boite = new Box3().setFromObject(objet)
    const taille = boite.getSize(new Vector3())
    const centre = boite.getCenter(new Vector3())
    return { objet, boite, largeur: taille.x, hauteur: taille.y, centre, avant: boite.min.z }
  }, [scene])

  const largeurPx = ECRAN.largeurPx
  const hauteurPx = dalle ? Math.round((largeurPx * dalle.hauteur) / dalle.largeur) : 0

  // La dalle devient un trou dans le canvas, à travers lequel on voit l'iframe
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

  const vue = useRef<HTMLDivElement | null>(null)
  const repere = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const parent = gl.domElement.parentElement
    const canvas = parent?.querySelector('canvas')
    if (!parent || !canvas) return

    const v = document.createElement('div')
    v.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0'
    const r = document.createElement('div')
    r.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;pointer-events:none'
    const f = document.createElement('iframe')
    f.src = ECRAN.os
    f.title = 'OS'
    f.allow = 'autoplay; encrypted-media; picture-in-picture'
    f.style.cssText = 'position:absolute;border:0;background:#000;pointer-events:none'
    f.onload = () => invalidate()
    r.appendChild(f)
    v.appendChild(r)
    parent.appendChild(v)
    vue.current = v
    repere.current = r
    iframe.current = f
    dernier.current = ''

    const avant = { position: canvas.style.position, zIndex: canvas.style.zIndex, pointerEvents: canvas.style.pointerEvents }
    canvas.style.position = 'relative'
    canvas.style.zIndex = '1'
    canvas.style.pointerEvents = 'none'
    invalidate()

    return () => {
      v.remove()
      vue.current = repere.current = iframe.current = null
      Object.assign(canvas.style, avant)
    }
  }, [gl, invalidate])

  useEffect(() => invalidate(), [net, invalidate])

  // Placement de l'iframe, à chaque image
  const matrice = useMemo(() => new Matrix4(), [])
  const coin = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    const el = iframe.current
    const v = vue.current
    const r = repere.current
    if (!el || !v || !r || !dalle) return
    camera.updateMatrixWorld()

    let style: string
    if (net) {
      const { min, max } = dalle.boite
      let gauche = Infinity, haut = Infinity, droite = -Infinity, bas = -Infinity
      for (const [x, y] of [[min.x, min.y], [max.x, min.y], [min.x, max.y], [max.x, max.y]]) {
        coin.set(x, y, dalle.avant).project(camera)
        const px = ((coin.x + 1) / 2) * size.width
        const py = ((1 - coin.y) / 2) * size.height
        gauche = Math.min(gauche, px); droite = Math.max(droite, px)
        haut = Math.min(haut, py); bas = Math.max(bas, py)
      }
      const l = Math.round(gauche), t = Math.round(haut)
      // Plus aucune 3D au-dessus de l'iframe : le navigateur dessine la page directement, sans l'étirer
      v.style.perspective = ''
      r.style.transform = ''
      r.style.transformStyle = 'flat'
      style = `left:${l}px;top:${t}px;width:${Math.round(droite) - l}px;height:${Math.round(bas) - t}px;transform:none`
    } else {
      // En 3D : même calcul que le CSS3DRenderer de three.js
      const fov = camera.projectionMatrix.elements[5] * (size.height / 2)
      v.style.perspective = `${fov}px`
      r.style.transformStyle = 'preserve-3d'
      r.style.transform =
        `translateZ(${fov}px)${matriceCamera(camera.matrixWorldInverse)}translate(${size.width / 2}px,${size.height / 2}px)`
      // Dalle : son centre, retournée pour faire face à -Z, à l'échelle d'un pixel CSS
      const echelle = dalle.largeur / largeurPx
      matrice.makeRotationY(Math.PI).scale(new Vector3(echelle, echelle, echelle)).setPosition(dalle.centre.x, dalle.centre.y, dalle.avant)
      style = `left:0;top:0;width:${largeurPx}px;height:${hauteurPx}px;transform:translate(-50%,-50%)${matriceObjet(matrice)}`
    }
    // On ne touche au style que s'il change : redimensionner l'iframe fait recalculer la page de l'OS
    if (style !== dernier.current) {
      dernier.current = style
      el.style.cssText = `position:absolute;border:0;display:block;background:#000;pointer-events:${actif ? 'auto' : 'none'};${style}`
    }
  })

  useEffect(() => {
    if (iframe.current) iframe.current.style.pointerEvents = actif ? 'auto' : 'none'
    dernier.current = ''
    invalidate()
  }, [actif, invalidate])

  useEffect(() => {
    const surMessage = (e: MessageEvent) => {
      if (e.source !== iframe.current?.contentWindow || e.data?.type !== 'touche') return
      window.dispatchEvent(new KeyboardEvent('keydown', { key: e.data.key }))
    }
    window.addEventListener('message', surMessage)
    return () => window.removeEventListener('message', surMessage)
  }, [])

  return null
}

const arrondi = (v: number) => (Math.abs(v) < 1e-10 ? 0 : v)

function matriceCamera(m: Matrix4) {
  const e = m.elements
  return `matrix3d(${[e[0], -e[1], e[2], e[3], e[4], -e[5], e[6], e[7], e[8], -e[9], e[10], e[11], e[12], -e[13], e[14], e[15]].map(arrondi).join(',')})`
}

function matriceObjet(m: Matrix4) {
  const e = m.elements
  return `matrix3d(${[e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map(arrondi).join(',')})`
}
