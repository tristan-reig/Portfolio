import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Technos, type TechnoId } from './technos'

// Éléments communs aux pages de projets

export function EnTete({
  titre,
  accroche,
  technos,
  infos,
  liens = [],
}: {
  titre: string
  accroche: string
  technos: TechnoId[]
  infos: [string, string][]
  liens?: { nom: string; lien: string; Icone: LucideIcon }[]
}) {
  return (
    <header className="pr-entete">
      <h1>{titre}</h1>
      <p className="portfolio-chapo">{accroche}</p>
      <Technos ids={technos} />
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

// Capture d'écran avec légende (cadre vide si l'image n'est pas là).
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

// Chiffres clés sur une ligne
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
