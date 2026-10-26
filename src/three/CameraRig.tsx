import { useEffect, useMemo, useRef } from 'react'
import { Box3, MathUtils, PerspectiveCamera, Vector3, type Camera, type CatmullRomCurve3, type Object3D } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import {
  BALAYAGE, DUREE_TRANSITION, ECRAN, LIMITES_ENSEMBLE, VUE_ECRAN, VUE_ENSEMBLE,
  type Vue, type VueId,
} from '../config/scene'
import { useModele } from './modele'
import { adoucir, analyserScene, creerChemin, planifierTrajet } from './trajet'

type Props = {
  // Vue demandée : ensemble, devant l'écran, ou zoom sur l'écran
  vue: VueId
  // La caméra balaie automatiquement la scène
  verrou: boolean
}

export default function CameraRig({ vue, verrou }: Props) {
  const ref = useRef<CameraControlsImpl>(null)
  const invalidate = useThree((s) => s.invalidate)
  const camera = useThree((s) => s.camera)
  const { scene } = useModele()
  const focus = vue !== 'ensemble'

  const premier = useRef(true)
  const vuePrecedente = useRef<VueId>(vue)
  const enTransition = useRef(false)
  const verrouRef = useRef(verrou)

  const poseLibre = useRef<Vue | null>(null)

  const balayage = useRef({ base: 0, phase: 0, temps: 0 })
  const balayageActif = useRef(false)
  const balayageSuspendu = useRef(false)

  const sens = useRef(1)

  // Géométrie de la scène, pour des trajets qui contournent les meubles
  const geometrie = useMemo(() => analyserScene(scene), [scene])

  // Trajet en cours entre deux vues
  const animation = useRef<{
    chemin: CatmullRomCurve3
    cibleDepart: Vector3
    cibleArrivee: Vector3
    duree: number
    temps: number
    fin: () => void
  } | null>(null)
  const cibleCourante = useMemo(() => new Vector3(), [])

  const animerTrajet = (points: Vector3[], cibleDepart: Vector3, cibleArrivee: Vector3) =>
    new Promise<void>((resolve) => {
      animation.current?.fin()
      const { chemin, duree } = creerChemin(points)
      animation.current = { chemin, cibleDepart, cibleArrivee, duree, temps: 0, fin: resolve }
      invalidate()
    })

  // Arrête le balayage en retenant dans quel sens il allait
  const arreterBalayage = () => {
    if (!balayageActif.current) return
    const b = balayage.current
    const vitesse = Math.cos(b.phase + (2 * Math.PI * b.temps) / BALAYAGE.periode)
    sens.current = vitesse < 0 ? -1 : 1
    balayageActif.current = false
  }

  // Lance un nouveau balayage depuis la position actuelle de la caméra
  const demarrerBalayage = (c: CameraControlsImpl) => {
    const [tx, ty, tz] = VUE_ENSEMBLE.cible
    c.setTarget(tx, ty, tz, true)
    c.rotatePolarTo(ENSEMBLE.polaire, true)
    c.dollyTo(ENSEMBLE.distance, true)
    c.normalizeRotations()

    const ecart = normaliser(c.azimuthAngle - BALAYAGE.centre)
    const depart = Math.max(-1, Math.min(1, ecart / BALAYAGE.amplitude))
    const phase = sens.current > 0 ? Math.asin(depart) : Math.PI - Math.asin(depart)
    balayage.current = { base: c.azimuthAngle - ecart, phase, temps: 0 }
    balayageActif.current = true
    invalidate()
  }

  // Transitions entre les vues
  useEffect(() => {
    const c = ref.current
    if (!c) return

    const anime = !premier.current
    premier.current = false

    const de = vuePrecedente.current
    if (de === 'ensemble' && vue !== 'ensemble') {
      const position = c.getPosition(new Vector3(), false)
      const cible = c.getTarget(new Vector3(), false)
      poseLibre.current = { position: position.toArray(), cible: cible.toArray() }
      balayageSuspendu.current = balayageActif.current
    }
    vuePrecedente.current = vue

    // Pendant le trajet : aucune limite, et la souris ne peut pas interférer
    leverLimites(c)
    activerInteractions(c, false)
    enTransition.current = true

    const cadrage =
      vue === 'ensemble' ? (poseLibre.current ?? VUE_ENSEMBLE)
      : vue === 'ecran' ? VUE_ECRAN
      : (cadrageZoom(scene, camera) ?? VUE_ECRAN)
    const [px, py, pz] = cadrage.position
    const [tx, ty, tz] = cadrage.cible
    let annule = false

    const trajet = anime
      ? animerTrajet(
          planifierTrajet(geometrie, c.getPosition(new Vector3(), false), new Vector3(px, py, pz), de, vue),
          c.getTarget(new Vector3(), false),
          new Vector3(tx, ty, tz),
        )
      : c.setLookAt(px, py, pz, tx, ty, tz, false)

    trajet.then(() => {
      if (annule) return
      enTransition.current = false
      if (focus) return

      poseLibre.current = null
      Object.assign(c, LIMITES_ENSEMBLE)
      activerInteractions(c, !verrouRef.current)

      if (verrouRef.current) {
        if (balayageSuspendu.current) {
          // La caméra revient au même angle, mais compté à un tour près : on recale le balayage dessus
          const b = balayage.current
          const angle = b.base + BALAYAGE.amplitude * Math.sin(b.phase + (2 * Math.PI * b.temps) / BALAYAGE.periode)
          b.base += Math.round((c.azimuthAngle - angle) / (2 * Math.PI)) * 2 * Math.PI
          balayageActif.current = true
          invalidate()
        } else {
          demarrerBalayage(c)
        }
      }
      balayageSuspendu.current = false
    })

    return () => {
      annule = true
    }
  }, [vue, scene, camera, geometrie])

  // Verrouillage et déverrouillage
  useEffect(() => {
    verrouRef.current = verrou
    const c = ref.current
    if (!c) return

    if (!verrou) arreterBalayage()

    if (focus || enTransition.current) return

    if (verrou) {
      activerInteractions(c, false)
      demarrerBalayage(c)
    } else {
      c.rotateTo(c.azimuthAngle, c.polarAngle, false)
      c.dollyTo(c.distance, false)
      activerInteractions(c, true)
    }
  }, [verrou, focus])

  useFrame((_, delta) => {
    const c = ref.current
    if (!c) return

    // Parcours du trajet en cours
    const a = animation.current
    if (a) {
      a.temps = Math.min(a.temps + Math.min(delta, 0.1), a.duree)
      const u = adoucir(a.temps / a.duree)
      const p = a.chemin.getPointAt(u)
      const t = cibleCourante.lerpVectors(a.cibleDepart, a.cibleArrivee, u)
      c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, false)
      if (a.temps >= a.duree) {
        animation.current = null
        a.fin()
      }
      invalidate()
      return
    }

    // Balayage : un aller-retour en douceur
    if (!balayageActif.current) return

    const b = balayage.current
    b.temps += Math.min(delta, 0.1)
    const angle = b.base + BALAYAGE.amplitude * Math.sin(b.phase + (2 * Math.PI * b.temps) / BALAYAGE.periode)
    c.rotateAzimuthTo(angle, true)

    invalidate()
  })

  return <CameraControls ref={ref} smoothTime={DUREE_TRANSITION} />
}

function cadrageZoom(scene: Object3D, camera: Camera): Vue | null {
  const dalle = scene.getObjectByName(ECRAN.objet)
  if (!dalle || !(camera instanceof PerspectiveCamera)) return null

  const boite = new Box3().setFromObject(dalle)
  const centre = boite.getCenter(new Vector3())
  const taille = boite.getSize(new Vector3())

  const tangente = Math.tan(MathUtils.degToRad(camera.fov / 2))
  const hauteurVisible = Math.max(taille.y, taille.x / camera.aspect) * ECRAN.margeZoom
  const distance = hauteurVisible / (2 * tangente)

  return {
    position: [centre.x, centre.y, centre.z - distance],
    cible: [centre.x, centre.y, centre.z],
  }
}

const ENSEMBLE = (() => {
  const [px, py, pz] = VUE_ENSEMBLE.position
  const [tx, ty, tz] = VUE_ENSEMBLE.cible
  const distance = Math.hypot(px - tx, py - ty, pz - tz)
  return { distance, polaire: Math.acos((py - ty) / distance) }
})()

// Ramène un angle entre -π et π
function normaliser(angle: number) {
  const tour = 2 * Math.PI
  return ((((angle + Math.PI) % tour) + tour) % tour) - Math.PI
}

function leverLimites(c: CameraControlsImpl) {
  c.minDistance = 0
  c.maxDistance = Infinity
  c.minPolarAngle = 0
  c.maxPolarAngle = Math.PI
}

function activerInteractions(c: CameraControlsImpl, actives: boolean) {
  const A = CameraControlsImpl.ACTION
  c.mouseButtons.left = actives ? A.ROTATE : A.NONE
  c.mouseButtons.wheel = actives ? A.DOLLY : A.NONE
  c.mouseButtons.right = A.NONE
  c.touches.one = actives ? A.TOUCH_ROTATE : A.NONE
  c.touches.two = actives ? A.TOUCH_DOLLY : A.NONE
  c.touches.three = A.NONE
}
