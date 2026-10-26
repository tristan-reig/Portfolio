import { Box3, CatmullRomCurve3, MathUtils, Mesh, Vector3, type Object3D } from 'three'
import { ECRAN, TRAJET, type VueId } from '../config/scene'
import { estChaise } from '../utils/chaise'

// Calcul des trajets de la caméra entre deux vues, en contournant les meubles.

export type Geometrie = {
  centre: Vector3
  rayon: number
  hauteur: number
  azimutFace: number
  passage: Vector3
  dessus: Vector3
}

// Mesure la scène une fois chargée
export function analyserScene(scene: Object3D): Geometrie | null {
  scene.updateMatrixWorld(true)
  const dalle = scene.getObjectByName(ECRAN.objet)
  const chaise = new Box3()
  scene.traverse((o) => {
    if (o instanceof Mesh && estChaise(o)) chaise.expandByObject(o)
  })
  if (!dalle || chaise.isEmpty()) return null

  const tout = new Box3().setFromObject(scene)
  const centre = tout.getCenter(new Vector3())
  const x = new Box3().setFromObject(dalle).getCenter(new Vector3()).x

  // Distance horizontale du centre au coin le plus éloigné de la scène
  const demiLargeur = Math.hypot((tout.max.x - tout.min.x) / 2, (tout.max.z - tout.min.z) / 2)

  return {
    centre,
    rayon: demiLargeur + TRAJET.marge,
    hauteur: tout.max.y + TRAJET.hauteurContournement,
    azimutFace: Math.PI,
    passage: new Vector3(x, chaise.max.y + TRAJET.hauteurPassage, chaise.min.z - TRAJET.reculPassage),
    dessus: new Vector3(x, chaise.max.y + TRAJET.hauteurDessus, chaise.getCenter(new Vector3()).z),
  }
}

const azimut = (g: Geometrie, p: Vector3) => Math.atan2(p.x - g.centre.x, p.z - g.centre.z)

// Écart entre deux angles, ramené entre -π et π
const ecart = (a: number, b: number) => MathUtils.euclideanModulo(b - a + Math.PI, 2 * Math.PI) - Math.PI

// Distance horizontale d'un point au centre de la scène
const eloignement = (g: Geometrie, p: Vector3) => Math.hypot(p.x - g.centre.x, p.z - g.centre.z)

function arc(g: Geometrie, a: number, b: number, r0: number, h0: number, r1: number, h1: number): Vector3[] {
  const total = ecart(a, b)
  const pas = Math.max(1, Math.ceil(Math.abs(total) / MathUtils.degToRad(30)))
  const points: Vector3[] = []
  for (let i = 1; i <= pas; i++) {
    const k = i / pas
    const angle = a + total * k
    const rayon = Math.max(g.rayon, MathUtils.lerp(r0, r1, k))
    const hauteur = Math.max(g.hauteur, MathUtils.lerp(h0, h1, k))
    points.push(new Vector3(
      g.centre.x + Math.sin(angle) * rayon,
      hauteur,
      g.centre.z + Math.cos(angle) * rayon,
    ))
  }
  return points
}

// Liste des points par lesquels passe la caméra, départ et arrivée compris
export function planifierTrajet(g: Geometrie | null, depart: Vector3, arrivee: Vector3, de: VueId, vers: VueId): Vector3[] {
  const direct = [depart, arrivee]
  if (!g || de === vers) return direct

  const devant = (v: VueId) => v !== 'ensemble'
  if (devant(de) && devant(vers)) return direct

  const loinDeFace = (p: Vector3) => Math.abs(ecart(azimut(g, p), g.azimutFace)) > MathUtils.degToRad(TRAJET.angleDirect)
  const auDessusAssise = (p: Vector3) => p.z > g.dessus.z

  if (devant(vers)) {
    // Aller : contourner le bureau si besoin, enjamber le dossier, puis descendre vers l'écran
    const points = [depart]
    if (loinDeFace(depart)) {
      points.push(...arc(g, azimut(g, depart), g.azimutFace, eloignement(g, depart), depart.y, g.rayon, g.hauteur))
    }
    points.push(g.passage)
    if (auDessusAssise(arrivee)) points.push(g.dessus)
    points.push(arrivee)
    return points
  }

  // Retour : le même chemin à l'envers
  const points = [depart]
  if (auDessusAssise(depart)) points.push(g.dessus)
  points.push(g.passage)
  if (loinDeFace(arrivee)) {
    points.push(...arc(g, g.azimutFace, azimut(g, arrivee), g.rayon, g.hauteur, eloignement(g, arrivee), arrivee.y))
  }
  points.push(arrivee)
  return points
}

// Courbe lisse qui passe par tous les points, parcourue d'un seul mouvement
export function creerChemin(points: Vector3[]) {
  const chemin = new CatmullRomCurve3(points, false, 'centripetal')
  const duree = MathUtils.clamp(chemin.getLength() / TRAJET.vitesse, TRAJET.dureeMin, TRAJET.dureeMax)
  return { chemin, duree }
}

// Accélère au départ et ralentit à l'arrivée
export const adoucir = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
