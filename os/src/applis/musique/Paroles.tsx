import { useEffect, useRef, useState } from 'react'
import { chargerParoles, type Paroles as ParolesTrouvees } from './paroles'

type Props = {
  id: string
  titre: string
  artiste: string
  duree: number
  position: number // secondes
  onChercher: (secondes: number) => void
}

// Place de la ligne chantée dans le bloc : 0 en haut, 1 en bas
const HAUTEUR_LIGNE_ACTIVE = 0.3

// Paroles du titre en cours : la ligne chantée est mise en avant et reste au premier tiers du bloc ;
// un clic sur une ligne y amène la lecture
export default function Paroles({ id, titre, artiste, duree, position, onChercher }: Props) {
  const [resultat, setResultat] = useState<{ id: string; paroles: ParolesTrouvees | null; erreur?: string } | null>(null)
  const zone = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let annule = false
    chargerParoles(id, titre, artiste, duree)
      .then((paroles) => !annule && setResultat({ id, paroles }))
      .catch((e: Error) => !annule && setResultat({ id, paroles: null, erreur: e.message }))
    return () => {
      annule = true
    }
  }, [id, titre, artiste, duree])

  // Les paroles affichées sont-elles bien celles du titre en cours ?
  const paroles = resultat?.id === id ? resultat.paroles : undefined

  // Ligne en cours : la dernière dont le temps est passé (un léger avance pour suivre la voix)
  const lignes = paroles?.type === 'synchronisees' ? paroles.lignes : []
  let active = -1
  for (let i = 0; i < lignes.length && lignes[i].temps <= position + 0.3; i++) active = i

  useEffect(() => {
    const el = zone.current?.querySelector<HTMLElement>('.paroles-active')
    const conteneur = zone.current
    if (!el || !conteneur) return
    conteneur.scrollTo({ top: el.offsetTop - conteneur.clientHeight * HAUTEUR_LIGNE_ACTIVE, behavior: 'smooth' })
  }, [active, id])

  if (resultat?.id === id && resultat.erreur) return <p className="paroles-message">Paroles non disponibles pour ce titre.</p>
  if (paroles === undefined) return <p className="paroles-message">Recherche des paroles…</p>
  if (!paroles || paroles.type === 'introuvables') return <p className="paroles-message">Paroles non disponibles pour ce titre.</p>
  if (paroles.type === 'instrumental') return <p className="paroles-message">♪ Morceau instrumental</p>

  return (
    <div className="paroles" ref={zone}>
      {paroles.type === 'synchronisees'
        ? paroles.lignes.map((l, i) => (
            <button
              key={i}
              className={`paroles-ligne${i === active ? ' paroles-active' : i < active ? ' paroles-passee' : ''}`}
              onClick={() => onChercher(l.temps)}
            >
              {l.texte || '♪'}
            </button>
          ))
        : paroles.lignes.map((texte, i) => (
            <p key={i} className="paroles-ligne paroles-simple">
              {texte || ' '}
            </p>
          ))}
    </div>
  )
}
