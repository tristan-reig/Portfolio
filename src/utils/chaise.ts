import type { Object3D } from 'three'

// Noms des objets de la chaise dans Blender
export const PIECES_CHAISE = ['Accoudoirs', 'Assise', 'Dossier', 'Pietement', 'Roulettes', 'Verin', 'Chaise']

// Vrai si l'objet, ou l'un de ses parents, est une pièce de la chaise
export function estChaise(objet: Object3D | null): boolean {
  for (let o = objet; o; o = o.parent) {
    if (PIECES_CHAISE.includes(o.name)) return true
  }
  return false
}
