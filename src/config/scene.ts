export type Vec3 = [number, number, number]

export type Vue = {
  position: Vec3
  cible: Vec3
}

export const MODELE = '/models/scene.glb'

// Vue d'ensemble : derrière la chaise, légèrement sur la gauche
export const VUE_ENSEMBLE: Vue = {
  position: [2.0, 1.85, -3.05],
  cible: [0, 0.75, 0],
}

// Vue écran : à hauteur de tête, 1 m devant la dalle
export const VUE_ECRAN: Vue = {
  position: [0.177, 1.05, -0.84],
  cible: [0.177, 0.93, 0.16],
}

// Limites de la caméra en vue d'ensemble
export const LIMITES_ENSEMBLE = {
  minDistance: 2.5,
  maxDistance: 5.5,
  minPolarAngle: Math.PI / 6,
  maxPolarAngle: Math.PI / 2.3,
}

// Durée approximative des transitions de caméra, en secondes
export const DUREE_TRANSITION = 0.6
