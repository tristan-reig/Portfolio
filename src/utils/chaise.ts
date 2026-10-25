import type { Object3D } from 'three'

export const PIECES_CHAISE = ['Accoudoirs', 'Assise', 'Dossier', 'Pietement', 'Roulettes', 'Verin', 'Chaise']

export function estChaise(objet: Object3D | null): boolean {
  for (let o = objet; o; o = o.parent) {
    if (PIECES_CHAISE.includes(o.name)) return true
  }
  return false
}
