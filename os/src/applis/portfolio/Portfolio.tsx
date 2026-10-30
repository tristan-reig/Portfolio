import { useRef, useState, type ComponentType } from 'react'
import APropos from './APropos'
import Contact from './Contact'
import type { PropsRubrique, Rubrique } from './navigation'
import './Portfolio.css'

const NOM = 'Tristan Reig'
const SOUS_TITRE = 'Master IMAGINE · 42 Perpignan'

const FORMATIONS = [
  { nom: 'Master IMAGINE', logo: 'um.png', sigle: 'UM', ecole: 'Université de Montpellier' },
  { nom: '42 Perpignan', logo: '42.svg', sigle: '42', ecole: 'École 42' },
]

function AVenir() {
  return <p className="portfolio-doux">Contenu à venir.</p>
}

// Rubriques du portfolio
const RUBRIQUES = [
  { id: 'apropos', titre: 'À propos', Contenu: APropos },
  { id: 'projets', titre: 'Projets', Contenu: AVenir },
  { id: 'contact', titre: 'Contact', Contenu: Contact },
] as const satisfies readonly { id: Rubrique; titre: string; Contenu: ComponentType<PropsRubrique> }[]

export default function Portfolio() {
  const [rubrique, setRubrique] = useState<Rubrique | null>(null)
  const contenu = useRef<HTMLDivElement>(null)
  const ouverte = RUBRIQUES.find((r) => r.id === rubrique)

  const aller = (r: Rubrique | null) => {
    setRubrique(r)
    contenu.current?.scrollTo(0, 0)
  }

  if (!ouverte) {
    return (
      <div className="portfolio-cadre">
        <div className="portfolio">
          <div className="portfolio-accueil">
            <h1>{NOM}</h1>
            <p className="portfolio-sous-titre">{SOUS_TITRE}</p>
            <nav className="portfolio-liens" aria-label="Rubriques">
              {RUBRIQUES.map((r) => (
                <button key={r.id} onClick={() => aller(r.id)}>
                  {r.titre}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio-cadre">
      <div className="portfolio portfolio-avec-menu">
        <aside className="portfolio-menu">
          <button className="portfolio-menu-nom" onClick={() => aller(null)} title="Accueil">
            {NOM}
          </button>
          <ul className="portfolio-formations">
            {FORMATIONS.map((f) => (
              <li key={f.nom}>
                <Logo fichier={f.logo} sigle={f.sigle} ecole={f.ecole} />
                {f.nom}
              </li>
            ))}
          </ul>
          <nav aria-label="Rubriques">
            {RUBRIQUES.map((r) => (
              <button
                key={r.id}
                className={r.id === rubrique ? 'portfolio-menu-actif' : undefined}
                aria-current={r.id === rubrique ? 'page' : undefined}
                onClick={() => aller(r.id)}
              >
                {r.titre}
              </button>
            ))}
          </nav>
        </aside>

        <div className="portfolio-contenu" ref={contenu}>
          <article key={ouverte.id} className="portfolio-article">
            <ouverte.Contenu aller={aller} />
          </article>
        </div>
      </div>
    </div>
  )
}

function Logo({ fichier, sigle, ecole }: { fichier: string; sigle: string; ecole: string }) {
  const [absent, setAbsent] = useState(false)
  if (absent) {
    return (
      <span className="portfolio-logo portfolio-logo-sigle" title={ecole}>
        {sigle}
      </span>
    )
  }
  return (
    <img
      className="portfolio-logo"
      src={`${import.meta.env.BASE_URL}logos/${fichier}`}
      alt={ecole}
      title={ecole}
      onError={() => setAbsent(true)}
    />
  )
}
