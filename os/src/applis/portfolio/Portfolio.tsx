import { useState } from 'react'
import './Portfolio.css'

const NOM = 'Tristan Reig'
const SOUS_TITRE = 'Master IMAGINE - 42 Perpignan'

// Rubriques du portfolio
const RUBRIQUES = [
  { id: 'apropos', titre: 'À propos' },
  { id: 'projets', titre: 'Projets' },
  { id: 'contact', titre: 'Contact' },
] as const

type Rubrique = (typeof RUBRIQUES)[number]['id']

export default function Portfolio() {
  const [rubrique, setRubrique] = useState<Rubrique | null>(null)
  const ouverte = RUBRIQUES.find((r) => r.id === rubrique)

  return (
    <div className="portfolio">
      <main className="portfolio-page">
        {ouverte ? (
          // Rubrique : contenu à venir
          <section className="portfolio-rubrique">
            <button className="portfolio-retour" onClick={() => setRubrique(null)}>
              ← Accueil
            </button>
            <h2>{ouverte.titre}</h2>
            <p className="portfolio-doux">Contenu à venir.</p>
          </section>
        ) : (
          <div className="portfolio-accueil">
            <h1>{NOM}</h1>
            <p className="portfolio-sous-titre">{SOUS_TITRE}</p>
            <nav className="portfolio-liens" aria-label="Rubriques">
              {RUBRIQUES.map((r) => (
                <button key={r.id} onClick={() => setRubrique(r.id)}>
                  {r.titre}
                </button>
              ))}
            </nav>
          </div>
        )}
      </main>
    </div>
  )
}
