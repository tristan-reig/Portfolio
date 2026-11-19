import { ExternalLink } from 'lucide-react'
import { EnTete, Fiche } from './elements'

const BASE = `${import.meta.env.BASE_URL}projets/simsengine/`

// Les cinq créatures qui font les épreuves
type Creature = { nom: string; couleur: string; segments: number[][]; articulations: number[][] }

const CREATURES: Creature[] = [
  {
    nom: 'Ver',
    couleur: '#3d9a8b',
    segments: [[-0.25, 0.055, 0.25, 0.055, 0.1], [0.25, 0.055, 0.75, 0.055, 0.1], [0.75, 0.055, 1.25, 0.055, 0.1], [1.25, 0.055, 1.75, 0.055, 0.1]],
    articulations: [[0.25, 0.055], [0.75, 0.055], [1.25, 0.055]],
  },
  {
    nom: 'Serpent',
    couleur: '#84a93c',
    segments: [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((x) => [x, 0.045, x + 0.3, 0.045, 0.08]),
    articulations: [0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((x) => [x, 0.045]),
  },
  {
    nom: 'Quadrupède',
    couleur: '#e07a5f',
    segments: [[0, 0.55, 1, 0.55, 0.2], [0.9, 0.45, 0.9, 0.25, 0.08], [0.9, 0.25, 0.9, 0.005, 0.08], [0.1, 0.45, 0.1, 0.25, 0.08], [0.1, 0.25, 0.1, 0.005, 0.08]],
    articulations: [[0.9, 0.45], [0.9, 0.25], [0.1, 0.45], [0.1, 0.25]],
  },
  {
    nom: 'Sauteur',
    couleur: '#9b6ec8',
    segments: [[0.05, 0.85, 0.35, 1.15, 0.16], [0.05, 0.85, -0.6, 0.04, 0.06], [0.05, 0.85, 0.05, 0.45, 0.08], [0.05, 0.45, 0.05, 0.08, 0.08], [-0.12, 0.045, 0.28, 0.045, 0.07]],
    articulations: [[0.05, 0.85], [0.05, 0.45], [0.05, 0.08]],
  },
  {
    nom: 'Bipède',
    couleur: '#4682c8',
    segments: [[0, 0.93, 0, 1.43, 0.18], [0, 0.93, 0, 0.53, 0.08], [0, 0.53, 0, 0.08, 0.08], [-0.08, 0.045, 0.2, 0.045, 0.07], [0, 0.93, 0.12, 0.55, 0.08], [0.12, 0.55, 0.12, 0.08, 0.08], [0.04, 0.045, 0.32, 0.045, 0.07]],
    articulations: [[0, 0.93], [0, 0.53], [0, 0.08], [0.12, 0.55], [0.12, 0.08]],
  },
]

// Dessin d'une créature à partir de ses segments
function Silhouette({ creature }: { creature: Creature }) {
  const xs = creature.segments.flatMap((s) => [s[0], s[2]])
  const ys = creature.segments.flatMap((s) => [s[1], s[3]])
  const marge = 0.12
  const [x0, x1] = [Math.min(...xs) - marge, Math.max(...xs) + marge]
  const hauteur = Math.max(1.5, Math.max(...ys) + marge)
  const y = (v: number) => hauteur - v
  return (
    <svg viewBox={`${x0} 0 ${x1 - x0} ${hauteur + 0.04}`} aria-hidden="true">
      <line x1={x0} y1={y(0)} x2={x1} y2={y(0)} className="se-sol" />
      {creature.segments.map(([ax, ay, bx, by, l], i) => (
        <line key={i} x1={ax} y1={y(ay)} x2={bx} y2={y(by)} stroke={creature.couleur} strokeWidth={l} strokeLinecap="round" />
      ))}
      {creature.articulations.map(([ax, ay], i) => (
        <circle key={i} cx={ax} cy={y(ay)} r={0.035} className="se-articulation" />
      ))}
    </svg>
  )
}

// Réseau de neurones simplifié d'un champion
const ENTREES = ['angle 1', 'angle 2', 'contact', 'nourriture', 'horloge']
const SORTIES = ['moteur 1', 'moteur 2', 'moteur 3']
const LIENS: [number, number, number][] = [
  [0, 0, 0.8], [1, 1, -0.6], [2, 2, 0.5], [3, 0, -0.9], [3, -1, 0.7], [4, 1, 1], [4, 2, -0.7], [1, 2, 0.3],
]

function Reseau() {
  const yEntree = (i: number) => 30 + i * 52
  const ySortie = (i: number) => 56 + i * 78
  const cache = { x: 230, y: 210 }
  return (
    <svg className="se-reseau" viewBox="0 0 440 270" role="img" aria-label="Réseau de neurones : les capteurs commandent les moteurs des articulations">
      {LIENS.map(([e, s, p], i) => {
        const a = { x: 100, y: yEntree(e) }
        const b = s < 0 ? cache : { x: 350, y: ySortie(s) }
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={p > 0 ? 'se-positif' : 'se-negatif'} strokeWidth={1 + Math.abs(p) * 3} />
      })}
      <line x1={cache.x} y1={cache.y} x2={350} y2={ySortie(2)} className="se-positif" strokeWidth={3} />
      {ENTREES.map((nom, i) => (
        <g key={nom}>
          <circle cx={100} cy={yEntree(i)} r={9} className="se-noeud" />
          <text x={86} y={yEntree(i) + 4} textAnchor="end">{nom}</text>
        </g>
      ))}
      <circle cx={cache.x} cy={cache.y} r={9} className="se-noeud se-noeud-cache" />
      <text x={cache.x} y={cache.y + 28} textAnchor="middle" className="se-nouveau">neurone ajouté</text>
      {SORTIES.map((nom, i) => (
        <g key={nom}>
          <circle cx={350} cy={ySortie(i)} r={9} className="se-noeud se-noeud-sortie" />
          <text x={366} y={ySortie(i) + 4}>{nom}</text>
        </g>
      ))}
    </svg>
  )
}

const MEILLEURE = [1.54, 1.78, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 3.02, 3.02, 3.02, 3.02, 3.02, 3.37, 3.39, 3.85, 3.85, 3.85, 3.85, 3.85, 3.85, 3.92, 3.92, 3.92, 3.92, 3.96, 3.96, 3.96]
const MOYENNE = [-0.28, -0.12, -0.01, 0.12, 0.1, 0.34, 0.28, 0.37, 0.69, 0.72, 0.57, 0.73, 0.56, 0.74, 0.92, 1.08, 0.94, 0.75, 1.2, 1.11, 1.44, 1.53, 1.41, 1.39, 1.43, 1.63, 1.72, 1.47, 1.66, 1.69]

function Courbe() {
  const L = 400, H = 220, g = 34, d = 12, h = 14, b = 30
  const x = (i: number) => g + (i / (MEILLEURE.length - 1)) * (L - g - d)
  const y = (v: number) => h + ((4.5 - v) / 5) * (H - h - b)
  const trace = (valeurs: number[]) => valeurs.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('')
  return (
    <figure className="se-courbe">
      <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label="Fitness du meilleur individu et moyenne de la population, sur 30 générations">
        {[0, 1, 2, 3, 4].map((v) => (
          <g key={v}>
            <line x1={g} x2={L - d} y1={y(v)} y2={y(v)} className="se-grille" />
            <text x={g - 8} y={y(v) + 4} textAnchor="end">{v}</text>
          </g>
        ))}
        {[0, 10, 20, 29].map((i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor="middle">{i}</text>
        ))}
        <path d={trace(MOYENNE)} className="se-moyenne" />
        <path d={trace(MEILLEURE)} className="se-meilleure" />
      </svg>
      <figcaption>
        <span className="se-legende-meilleure">meilleur individu</span>
        <span className="se-legende-moyenne">moyenne des 150</span>
        <span className="se-legende-titre">Fitness à chaque génération : le quadrupède qui va chercher la nourriture</span>
      </figcaption>
    </figure>
  )
}

const EPREUVES: [string, string][] = [
  ['nage.webp', 'Nage : le serpent avance par ondulations, sans sol'],
  ['nourriture.webp', 'Nourriture : le quadrupède va chercher les boules'],
  ['ballon.webp', 'Ballon : le bipède pousse le ballon'],
  ['debogage.webp', 'Vue de débogage : les formes physiques réelles'],
]

export default function SimsEngine() {
  return (
    <>
      <EnTete
        titre="SimsEngine"
        accroche="Des créatures virtuelles qui apprennent à se déplacer toutes seules."
        technos={['python', 'numpy']}
        infos={[
          ['Cadre', 'Université'],
          ['Année', '2026'],
          ['Physique', 'pymunk'],
          ['Affichage', 'pygame'],
        ]}
        liens={[{ nom: 'Code source', lien: 'https://github.com/tristan-reig/SimsEngine', Icone: ExternalLink }]}
      />

      <figure className="se-video">
        <video src={`${BASE}marche.mp4`} poster={`${BASE}marche.webp`} autoPlay muted loop playsInline />
        <figcaption>Un bipède après 30 générations : personne ne lui a appris à marcher</figcaption>
      </figure>

      <section className="pr-section">
        <h2>Le projet</h2>
        <p>
          Chaque créature est un corps articulé, simulé en 2D vue de profil. Son cerveau est un réseau de neurones qui
          lit ses capteurs et commande ses articulations. Personne n'écrit ce réseau à la main : il est trouvé par
          NEAT, un algorithme évolutionnaire qui fait évoluer à la fois les poids et la structure des réseaux.
        </p>
        <p>
          Le moteur est générique : n'importe quel corps décrit dans un fichier YAML peut être simulé et entraîné dans
          cinq scénarios, sans écrire de code. Une démo interactive permet de regarder les champions, ou de suivre une
          évolution en direct.
        </p>
      </section>

      <Fiche
        chiffres={[
          ['5', 'créatures'],
          ['5', 'scénarios'],
          ['150', 'individus par génération'],
          ['~3 500', 'lignes de code'],
        ]}
      />

      <section className="pr-section">
        <h2>Sous le capot</h2>

        <h3 className="se-titre-seul">Des corps décrits en YAML</h3>
        <p>
          Une créature est une liste de segments rigides reliés par des articulations motorisées, avec leurs butées et
          leur couple maximal. Les cinq créatures ci-dessous sont dessinées directement à partir de leurs fichiers.
        </p>
        <ul className="se-creatures">
          {CREATURES.map((c) => (
            <li key={c.nom}>
              <Silhouette creature={c} />
              <span>
                <i style={{ background: c.couleur }} />
                {c.nom}
              </span>
            </li>
          ))}
        </ul>

        <div className="pr-bloc">
          <div>
            <h3>Un cerveau qui évolue</h3>
            <p>
              À chaque pas, le réseau reçoit l'angle de chaque articulation, les contacts avec le sol, les capteurs du
              scénario et une horloge qui facilite les mouvements rythmiques. Il renvoie une commande par articulation.
            </p>
            <p>
              NEAT est écrit de zéro, d'après l'article original : numéros d'innovation pour aligner les génomes,
              croisement, mutations qui ajoutent des connexions et des neurones, et spéciation pour protéger les
              nouvelles structures. L'évaluation des 150 individus est répartie sur tous les processeurs.
            </p>
          </div>
          <Reseau />
        </div>

        <h3 className="se-titre-seul">Cinq épreuves</h3>
        <p>
          Marcher, nager, aller chercher de la nourriture, pousser un ballon ou fuir un rocher qui accélère : chaque
          scénario a ses capteurs et sa façon de noter les créatures.
        </p>
        <div className="se-galerie">
          {EPREUVES.map(([image, legende]) => (
            <figure key={image}>
              <img src={`${BASE}${image}`} alt={legende} loading="lazy" />
              <figcaption>{legende}</figcaption>
            </figure>
          ))}
        </div>

        <div className="pr-bloc pr-bloc-inverse">
          <div>
            <h3>Des expériences</h3>
            <p>
              Des scripts comparent plusieurs réglages sur plusieurs graines. À budget égal, NEAT dépasse une recherche
              aléatoire de mouvements sinusoïdaux dans 21 combinaisons sur 25, surtout quand il faut percevoir
              l'environnement ou garder l'équilibre.
            </p>
            <p>
              Les évolutions sont déterministes : avec la même graine, on obtient exactement le même résultat. Et NEAT
              exploite la moindre faille du simulateur, articulations qui se déboîtent ou ballon qui ne freine pas :
              chacune a dû être corrigée.
            </p>
          </div>
          <Courbe />
        </div>
      </section>

      <p className="pr-credits">
        NEAT : K. O. Stanley et R. Miikkulainen, <em>Evolving Neural Networks through Augmenting Topologies</em>, 2002.
        Physique{' '}
        <a href="https://www.pymunk.org" target="_blank" rel="noreferrer">
          pymunk
        </a>
        , affichage{' '}
        <a href="https://www.pygame.org" target="_blank" rel="noreferrer">
          pygame
        </a>
        .
      </p>
    </>
  )
}
