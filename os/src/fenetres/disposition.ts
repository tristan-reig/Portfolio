// Disposition "dwindle" de Hyprland

export type Rect = { x: number; y: number; largeur: number; hauteur: number }

export const ESPACE = 8

export function disposer(n: number, zone: Rect): Rect[] {
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

export type Direction = 'gauche' | 'droite' | 'haut' | 'bas'

export function voisine(rects: Rect[], i: number, direction: Direction): number | null {
  const a = rects[i]
  let meilleure: number | null = null
  let distanceMin = Infinity
  rects.forEach((r, j) => {
    if (j === i) return
    const horizontal = direction === 'gauche' || direction === 'droite'
    const enFace = horizontal ? r.y < a.y + a.hauteur && r.y + r.hauteur > a.y : r.x < a.x + a.largeur && r.x + r.largeur > a.x
    const distance =
      direction === 'droite' ? r.x - (a.x + a.largeur)
      : direction === 'gauche' ? a.x - (r.x + r.largeur)
      : direction === 'bas' ? r.y - (a.y + a.hauteur)
      : a.y - (r.y + r.hauteur)
    if (enFace && distance >= 0 && distance < distanceMin) {
      distanceMin = distance
      meilleure = j
    }
  })
  return meilleure
}
