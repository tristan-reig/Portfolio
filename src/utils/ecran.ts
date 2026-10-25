import type { Object3D } from 'three'
import { ECRAN } from '../config/scene'

const PIECES_ECRAN = [ECRAN.objet, 'Ecran']

export function estEcran(objet: Object3D | null): boolean {
  for (let o = objet; o; o = o.parent) {
    if (PIECES_ECRAN.includes(o.name)) return true
  }
  return false
}
