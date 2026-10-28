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

// Trajets de la caméra entre les vues
export const TRAJET = {
  vitesse: 2.4,
  dureeMin: 0.9,
  dureeMax: 2.8,
  angleDirect: 50,
  marge: 0.9,
  hauteurContournement: 0.5,
  hauteurPassage: 0.4,
  reculPassage: 0.35,
  hauteurDessus: 0.25,
}

export const ECRAN = {
  objet: 'Ecran_Dalle',
  os: import.meta.env.DEV ? 'http://localhost:5174/os/' : '/os/',
  margeZoom: 1.12,
}

// Balayage automatique de la caméra verrouillée.
export const BALAYAGE = {
  centre: Math.PI,
  amplitude: Math.PI / 2,
  periode: 40,
}

export type VueId = 'ensemble' | 'ecran' | 'zoom'
