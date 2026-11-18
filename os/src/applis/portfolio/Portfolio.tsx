import { useEffect, useRef, useState, type ComponentType } from 'react'
import APropos from './APropos'
import Contact from './Contact'
import Projets from './Projets'
import { memePage, type Page, type PropsRubrique, type Rubrique } from './navigation'
import './Portfolio.css'

// Textes de la page d'accueil
const NOM = 'Tristan Reig'
const SOUS_TITRE = 'Master IMAGINE · 42 Perpignan'

// Formations affichées sous le nom
const FORMATIONS = [
  { nom: 'Master IMAGINE', logo: 'um.svg', sigle: 'UM', ecole: 'Université de Montpellier' },
  { nom: '42 Perpignan', logo: '42.svg', sigle: '42', ecole: 'École 42' },
]

// Rubriques du portfolio, dans l'ordre des liens
const RUBRIQUES = [
  { id: 'apropos', titre: 'À propos', Contenu: APropos },
  { id: 'projets', titre: 'Projets', Contenu: Projets },
  { id: 'contact', titre: 'Contact', Contenu: Contact },
] as const satisfies readonly { id: Rubrique; titre: string; Contenu: ComponentType<PropsRubrique> }[]

export default function Portfolio() {
  // Historique des pages visitées
  const [historique, setHistorique] = useState<{ pages: Page[]; position: number }>({
    pages: [{ rubrique: null }],
    position: 0,
  })
  const page = historique.pages[historique.position]
  const rubrique = page.rubrique
  const ouverte = RUBRIQUES.find((r) => r.id === rubrique)
  const cadre = useRef<HTMLDivElement>(null)
  const contenu = useRef<HTMLDivElement>(null)

  const naviguer = (p: Page) =>
    setHistorique((h) => {
      if (memePage(h.pages[h.position], p)) return h
      const pages = [...h.pages.slice(0, h.position + 1), p]
      return { pages, position: pages.length - 1 }
    })
  const aller = (r: Rubrique | null) => naviguer({ rubrique: r })
  const deplacer = (pas: number) =>
    setHistorique((h) => ({ ...h, position: Math.min(h.pages.length - 1, Math.max(0, h.position + pas)) }))

  // Chaque page s'ouvre en haut
  useEffect(() => {
    contenu.current?.scrollTo(0, 0)
  }, [page])

  // Alt ← / Alt → pour naviguer dans l'historique
  useEffect(() => {
    const actif = () => !!cadre.current?.closest('.fenetre-active')
    const surTouche = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || !actif()) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      deplacer(e.key === 'ArrowLeft' ? -1 : 1)
    }
    const surSouris = (e: MouseEvent) => {
      if ((e.button !== 3 && e.button !== 4) || !cadre.current?.contains(e.target as Node)) return
      e.preventDefault()
      deplacer(e.button === 3 ? -1 : 1)
    }
    window.addEventListener('keydown', surTouche)
    window.addEventListener('mouseup', surSouris)
    return () => {
      window.removeEventListener('keydown', surTouche)
      window.removeEventListener('mouseup', surSouris)
    }
  }, [])

  if (!ouverte) {
    return (
      <div className="portfolio-cadre" ref={cadre}>
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
    <div className="portfolio-cadre" ref={cadre}>
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
          <article key={`${page.rubrique}/${page.volet}/${page.projet}`} className="portfolio-article">
            <ouverte.Contenu page={page} naviguer={naviguer} aller={aller} />
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
