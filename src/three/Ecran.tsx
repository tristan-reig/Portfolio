import { useEffect, useMemo, useRef } from 'react'
import { Box3, DoubleSide, Matrix4, Mesh, ShaderMaterial, Vector3, type Material } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { ECRAN, MODELE } from '../config/scene'
import { useModele } from './modele'
import { useVueAtteinte } from './vueAtteinte'
import { signalerOsPret } from './osPret'

type Props = {
  // L'OS reçoit la souris (vue zoom) ; sinon les clics vont à la scène
  actif: boolean
}

export default function Ecran({ actif }: Props) {
  const { scene } = useModele()
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const iframe = useRef<HTMLIFrameElement | null>(null)
  const net = useVueAtteinte() === 'zoom'
  // Dernier style appliqué à l'iframe
  const dernier = useRef('')
  const osCharge = useRef(false)

  // Position et taille de la dalle, un plan tourné vers -Z
  const dalle = useMemo(() => {
    const objet = scene.getObjectByName(ECRAN.objet)
    if (!objet) return null
    const boite = new Box3().setFromObject(objet)
    const taille = boite.getSize(new Vector3())
    const centre = boite.getCenter(new Vector3())
    return { objet, boite, largeur: taille.x, hauteur: taille.y, centre, avant: boite.min.z }
  }, [scene])


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

  // Couche HTML sous le canvas, créée à la main (le rendu React de cette partie est celui de three.js) :
  // le canvas passe devant et laisse passer la souris, la dalle y découpe un trou
  const vue = useRef<HTMLDivElement | null>(null)
  const repere = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const parent = gl.domElement.parentElement
    const canvas = parent?.querySelector('canvas')
    if (!parent || !canvas) return

    const v = document.createElement('div')
    // Fond noir : c'est ce qu'on voit à travers la dalle tant que l'OS n'est pas chargé (écran éteint)
    v.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;background:#000'
    // Repère de la caméra : la transformation 3D s'applique ici, l'iframe s'y place
    const r = document.createElement('div')
    r.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;pointer-events:none'
    const f = document.createElement('iframe')
    f.src = ECRAN.os
    f.title = 'OS'
    // L'OS transmet ces permissions au lecteur YouTube qu'il contient : sans « autoplay », la musique ne démarre pas
    f.allow = 'autoplay; encrypted-media; picture-in-picture'
    f.style.cssText = 'position:absolute;border:0;background:#000;pointer-events:none;visibility:hidden'
    f.onload = () => {
      // L'OS est prêt : il s'affiche, et l'écran de chargement du site peut partir
      osCharge.current = true
      dernier.current = ''
      signalerOsPret()
      invalidate()
    }
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

  // On change de mode : une image de plus pour replacer l'iframe
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

    // Taille de l'iframe : celle de la dalle à l'écran en vue zoom (même calcul que cadrageZoom dans CameraRig).
    // Elle ne change pas d'un mode à l'autre : l'OS n'a pas à se redimensionner, donc pas de scintillement.
    const aspect = size.width / size.height
    const hauteurVisible = Math.max(dalle.hauteur, dalle.largeur / aspect) * ECRAN.margeZoom
    const largeur = Math.round((dalle.largeur / (hauteurVisible * aspect)) * size.width)
    const hauteur = Math.round((largeur * dalle.hauteur) / dalle.largeur)

    let style: string
    if (net) {
      // À plat : posée sur le coin haut gauche de la dalle à l'écran, arrondi au pixel
      const { min, max } = dalle.boite
      let gauche = Infinity, haut = Infinity
      for (const [x, y] of [[min.x, min.y], [max.x, min.y], [min.x, max.y], [max.x, max.y]]) {
        coin.set(x, y, dalle.avant).project(camera)
        const px = ((coin.x + 1) / 2) * size.width
        const py = ((1 - coin.y) / 2) * size.height
        gauche = Math.min(gauche, px)
        haut = Math.min(haut, py)
      }
      const l = Math.round(gauche), t = Math.round(haut)
      // Plus aucune 3D au-dessus de l'iframe : le navigateur dessine la page directement, sans l'étirer
      v.style.perspective = ''
      r.style.transform = ''
      r.style.transformStyle = 'flat'
      style = `left:${l}px;top:${t}px;width:${largeur}px;height:${hauteur}px;transform:none`
    } else {
      // En 3D : même calcul que le CSS3DRenderer de three.js
      const focale = camera.projectionMatrix.elements[5] * (size.height / 2)
      v.style.perspective = `${focale}px`
      r.style.transformStyle = 'preserve-3d'
      r.style.transform =
        `translateZ(${focale}px)${matriceCamera(camera.matrixWorldInverse)}translate(${size.width / 2}px,${size.height / 2}px)`
      // Dalle : son centre, retournée pour faire face à -Z, à l'échelle d'un pixel CSS
      const echelle = dalle.largeur / largeur
      matrice.makeRotationY(Math.PI).scale(new Vector3(echelle, echelle, echelle)).setPosition(dalle.centre.x, dalle.centre.y, dalle.avant)
      style = `left:0;top:0;width:${largeur}px;height:${hauteur}px;transform:translate(-50%,-50%)${matriceObjet(matrice)}`
    }
    // On ne touche au style que s'il change : redimensionner l'iframe fait recalculer la page de l'OS
    if (style !== dernier.current) {
      dernier.current = style
      el.style.cssText = `position:absolute;border:0;display:block;background:#000;pointer-events:${actif ? 'auto' : 'none'};visibility:${osCharge.current ? 'visible' : 'hidden'};${style}`
    }
  })

  // La souris passe à l'OS seulement en vue zoom
  useEffect(() => {
    if (iframe.current) iframe.current.style.pointerEvents = actif ? 'auto' : 'none'
    dernier.current = ''
    invalidate()
  }, [actif, invalidate])

  // En vue zoom, Espace met la musique en pause ou la relance, même si la souris n'a pas encore cliqué dans l'OS
  useEffect(() => {
    if (!actif) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.repeat) return
      e.preventDefault()
      iframe.current?.contentWindow?.postMessage({ type: 'touche', key: ' ' }, '*')
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [actif])

  // Les touches transmises par l'OS (Échap…) sont rejouées sur la page, comme si on les avait tapées ici
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

// Matrices au format CSS (axe Y vers le bas), reprises du CSS3DRenderer de three.js
const arrondi = (v: number) => (Math.abs(v) < 1e-10 ? 0 : v)

function matriceCamera(m: Matrix4) {
  const e = m.elements
  return `matrix3d(${[e[0], -e[1], e[2], e[3], e[4], -e[5], e[6], e[7], e[8], -e[9], e[10], e[11], e[12], -e[13], e[14], e[15]].map(arrondi).join(',')})`
}

function matriceObjet(m: Matrix4) {
  const e = m.elements
  return `matrix3d(${[e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map(arrondi).join(',')})`
}
