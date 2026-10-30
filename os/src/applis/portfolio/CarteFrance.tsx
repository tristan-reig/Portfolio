import { CARTE, kilometres, projeter } from './carteFrance'

// Villes autour desquelles je cherche (nom à droite pour l'une, à gauche pour l'autre : elles sont proches)
const VILLES = [
  { nom: 'Montpellier', lon: 3.8767, lat: 43.6108, cote: 'droite' },
  { nom: 'Perpignan', lon: 2.8948, lat: 42.6887, cote: 'gauche' },
] as const
const RAYON = 40 // km autour de chaque ville

// Repère discret pour se situer
const PARIS = projeter(2.3522, 48.8566)

// Zone en forme de gélule entre les deux villes : deux demi-cercles reliés par des segments
function gelule([ax, ay]: [number, number], [bx, by]: [number, number], r: number) {
  const l = Math.hypot(bx - ax, by - ay)
  const [nx, ny] = [(-(by - ay) / l) * r, ((bx - ax) / l) * r]
  const f = (x: number) => x.toFixed(1)
  return (
    `M${f(ax + nx)} ${f(ay + ny)}L${f(bx + nx)} ${f(by + ny)}` +
    `A${f(r)} ${f(r)} 0 0 0 ${f(bx - nx)} ${f(by - ny)}` +
    `L${f(ax - nx)} ${f(ay - ny)}` +
    `A${f(r)} ${f(r)} 0 0 0 ${f(ax + nx)} ${f(ay + ny)}Z`
  )
}

// Carte de France dessinée aux couleurs de l'OS, avec la zone où je cherche un stage
export default function CarteFrance() {
  const villes = VILLES.map((v) => ({ ...v, point: projeter(v.lon, v.lat) }))
  const zone = gelule(villes[0].point, villes[1].point, kilometres(RAYON))

  return (
    <svg
      className="carte-france"
      viewBox={`0 0 ${CARTE.largeur} ${CARTE.hauteur}`}
      role="img"
      aria-label="Carte de France : zone de recherche entre Montpellier et Perpignan"
    >
      <defs>
        {/* Trame de points, comme un papier millimétré */}
        <pattern id="carte-trame" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="carte-trame" />
        </pattern>
        <linearGradient id="carte-bord" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--bordure-active-1)" />
          <stop offset="1" stopColor="var(--bordure-active-2)" />
        </linearGradient>
        <filter id="carte-halo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#carte-trame)" />
      <path d={CARTE.voisins} className="carte-voisins" />
      <path d={CARTE.france} className="carte-pays" />

      {/* Zone : un halo flou dessous, puis la forme nette */}
      <path d={zone} className="carte-zone-halo" filter="url(#carte-halo)" />
      <path d={zone} className="carte-zone" />

      <g className="carte-repere">
        <circle cx={PARIS[0]} cy={PARIS[1]} r="4" />
        <text x={PARIS[0] + 10} y={PARIS[1] + 7}>
          Paris
        </text>
      </g>

      {villes.map((v) => (
        <g key={v.nom} className="carte-ville">
          <circle cx={v.point[0]} cy={v.point[1]} r="5" className="carte-ville-onde" />
          <circle cx={v.point[0]} cy={v.point[1]} r="5" className="carte-ville-point" />
          <text
            x={v.point[0] + (v.cote === 'droite' ? 12 : -12)}
            y={v.point[1] + 8}
            textAnchor={v.cote === 'droite' ? 'start' : 'end'}
          >
            {v.nom}
          </text>
        </g>
      ))}
    </svg>
  )
}
