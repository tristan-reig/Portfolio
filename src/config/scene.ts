export type Vec3 = [number, number, number]

export type Vue = {
  position: Vec3
  cible: Vec3
}

export const MODELE = '/models/scene.glb'

export const VUE_ENSEMBLE: Vue = {
  position: [2.0, 1.85, -3.05],
  cible: [0, 0.75, 0],
}

export const VUE_ECRAN: Vue = {
  position: [0.177, 1.25, -0.84],
  cible: [0.177, 0.93, 0.16],
}

export const LIMITES_ENSEMBLE = {
  minDistance: 2.5,
  maxDistance: 5.5,
  minPolarAngle: Math.PI / 6,
  maxPolarAngle: Math.PI / 2.3,
}

export const DUREE_TRANSITION = 0.6

export const ECRAN = {
  objet: 'Ecran_Dalle',
  haut: '#1e4fd8',
  bas: '#ffffff',
  margeZoom: 1.12,
}

// Balayage automatique de la caméra verrouillée.
export const BALAYAGE = {
  centre: Math.PI,
  amplitude: Math.PI / 2,
  periode: 40,
}

export type VueId = 'ensemble' | 'ecran' | 'zoom'
