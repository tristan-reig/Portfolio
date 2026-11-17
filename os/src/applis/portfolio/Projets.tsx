import { useState } from 'react'
import { ArrowRight, Box, Gamepad2, Terminal, type LucideIcon } from 'lucide-react'
import './Projets.css'

type Volet = { id: 'jeux' | 'logiciel' | '3d'; titre: string; sousTitre: string; Icone: LucideIcon }

const VOLETS: Volet[] = [
  { id: 'jeux', titre: 'Jeux vidéo', sousTitre: 'Gameplay et moteurs', Icone: Gamepad2 },
  { id: 'logiciel', titre: 'Logiciel', sousTitre: '& systèmes', Icone: Terminal },
  { id: '3d', titre: '3D', sousTitre: '& animation', Icone: Box },
]

export default function Projets() {
  const [volet, setVolet] = useState<Volet | null>(null)

  if (volet) {
    return (
      <div className="pj">
        <button className="pj-retour" onClick={() => setVolet(null)}>
          ← Projets
        </button>
        <h1>{volet.titre}</h1>
        <p className="portfolio-chapo">{volet.sousTitre}</p>
        <p className="portfolio-doux">Contenu à venir.</p>
      </div>
    )
  }

  return (
    <div className="pj">
      <h1>Projets</h1>
      <p className="pj-intro">
        Cliquez sur l'un des domaines ci-dessous pour découvrir les projets que j'y ai réalisés, avec des captures et
        des démos quand c'est possible.
      </p>

      <ul className="pj-volets">
        {VOLETS.map((v) => (
          <li key={v.id}>
            <button className="pj-volet" onClick={() => setVolet(v)}>
              <span className="pj-volet-icone">
                <v.Icone size={30} strokeWidth={1.6} aria-hidden />
              </span>
              <span className="pj-volet-texte">
                <strong>{v.titre}</strong>
                <span>{v.sousTitre}</span>
              </span>
              <ArrowRight className="pj-volet-fleche" size={22} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
