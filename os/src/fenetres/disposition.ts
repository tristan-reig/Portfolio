// Disposition dwindle

export type Rect = { x: number; y: number; largeur: number; hauteur: number }

export const ESPACE = 8

export function disposer(n: number, zone: Rect): Rect[] {
  // On agrandit la zone d'une demi-marge, puis on rétrécit chaque fenêtre d'une demi-marge
  const d = ESPACE / 2
  let reste: Rect = { x: zone.x - d, y: zone.y - d, largeur: zone.largeur + ESPACE, hauteur: zone.hauteur + ESPACE }
  const rects: Rect[] = []

  for (let i = 0; i < n; i++) {
    let place = reste
    if (i < n - 1) {
      if (reste.largeur >= reste.hauteur) {
        const l = reste.largeur / 2
        place = { ...reste, largeur: l }
        reste = { ...reste, x: reste.x + l, largeur: l }
      } else {
        const h = reste.hauteur / 2
        place = { ...reste, hauteur: h }
        reste = { ...reste, y: reste.y + h, hauteur: h }
      }
    }
    rects.push({ x: place.x + d, y: place.y + d, largeur: place.largeur - ESPACE, hauteur: place.hauteur - ESPACE })
  }
  return rects
}
