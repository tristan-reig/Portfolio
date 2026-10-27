import { useEffect, useRef, useState } from 'react'
import Calendrier from './Calendrier'
import { IconeAlimentation, IconeBatterie, IconeEclair, IconeFond, IconeReseau, IconeVolume } from './Icones'
import { useBatterie } from './useBatterie'
import { useHeure } from './useHeure'
import './Barre.css'

const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

type Props = {
  // Titre de la fenêtre active, affiché au centre
  titre: string
  // Ouvre le sélecteur de fond d'écran
  onFonds: () => void
}

export default function Barre({ titre, onFonds }: Props) {
  const maintenant = useHeure()
  const batterie = useBatterie()
  const [calendrier, setCalendrier] = useState(false)
  const zoneHeure = useRef<HTMLDivElement>(null)

  // Le calendrier se ferme avec Échap ou un clic ailleurs
  useEffect(() => {
    if (!calendrier) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setCalendrier(false)
    }
    const surClic = (e: PointerEvent) => {
      if (!zoneHeure.current?.contains(e.target as Node)) setCalendrier(false)
    }
    window.addEventListener('keydown', surTouche, true)
    window.addEventListener('pointerdown', surClic)
    return () => {
      window.removeEventListener('keydown', surTouche, true)
      window.removeEventListener('pointerdown', surClic)
    }
  }, [calendrier])

  return (
    <header className="barre">
      <div className="barre-gauche" ref={zoneHeure}>
        <button
          className={`barre-heure${calendrier ? ' barre-heure-ouverte' : ''}`}
          onClick={() => setCalendrier(!calendrier)}
          aria-expanded={calendrier}
          title="Calendrier"
        >
          <time dateTime={maintenant.toISOString()}>{formatHeure.format(maintenant)}</time>
          <span className="barre-doux">{formatDate.format(maintenant)}</span>
        </button>
        {calendrier && <Calendrier aujourdhui={maintenant} />}
      </div>

      {/* Réservé au titre de la fenêtre active */}
      <div className="barre-centre">
        {titre}
      </div>

      <div className="barre-droite">
        <button className="barre-icone" onClick={onFonds} title="Fond d'écran" aria-label="Fond d'écran">
          <IconeFond />
        </button>
        <span className="barre-icone" title="Réseau"><IconeReseau /></span>
        <span className="barre-icone" title="Volume"><IconeVolume /></span>
        {batterie && (
          <span
            className={`barre-batterie${batterie.niveau < 0.2 && !batterie.enCharge ? ' barre-faible' : ''}`}
            title={batterie.enCharge ? 'En charge' : 'Sur batterie'}
          >
            {batterie.enCharge && <IconeEclair />}
            <IconeBatterie niveau={batterie.niveau} />
            {Math.round(batterie.niveau * 100)}{'\u202f'}%
          </span>
        )}
        <span className="barre-icone" title="Alimentation"><IconeAlimentation /></span>
      </div>
    </header>
  )
}
