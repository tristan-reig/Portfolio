import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'

// Éléments communs aux pages de projets

// Titre, accroche, fiche technique et liens
export function EnTete({
  titre,
  accroche,
  infos,
  liens = [],
}: {
  titre: string
  accroche: string
  infos: [string, string][]
  liens?: { nom: string; lien: string; Icone: LucideIcon }[]
}) {
  return (
    <header className="pr-entete">
      <h1>{titre}</h1>
      <p className="portfolio-chapo">{accroche}</p>
      <dl className="pr-infos">
        {infos.map(([nom, valeur]) => (
          <div key={nom}>
            <dt>{nom}</dt>
            <dd>{valeur}</dd>
          </div>
        ))}
      </dl>
      {liens.length > 0 && (
        <div className="pr-liens">
          {liens.map(({ nom, lien, Icone }) => (
            <a key={nom} href={lien} target="_blank" rel="noreferrer">
              {nom} <Icone size={14} aria-hidden />
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

// Capture d'écran avec légende. Tant que l'image n'existe pas, un cadre vide garde sa place.
export function Capture({ image, legende, grande }: { image: string; legende: string; grande?: boolean }) {
  const [absente, setAbsente] = useState(false)
  return (
    <figure className={`pr-capture${grande ? ' pr-capture-grande' : ''}`}>
      {absente ? (
        <div className="pr-capture-vide">{image.split('/').pop()}</div>
      ) : (
        <img src={`${import.meta.env.BASE_URL}${image}`} alt={legende} loading="lazy" onError={() => setAbsente(true)} />
      )}
      <figcaption>{legende}</figcaption>
    </figure>
  )
}

// Quelques chiffres clés, sur une ligne
export function Fiche({ chiffres }: { chiffres: [string, string][] }) {
  return (
    <dl className="pr-fiche">
      {chiffres.map(([valeur, texte]) => (
        <div key={texte}>
          <dt>{valeur}</dt>
          <dd>{texte}</dd>
        </div>
      ))}
    </dl>
  )
}
