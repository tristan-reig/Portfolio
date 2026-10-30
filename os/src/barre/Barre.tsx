import { useEffect, useRef, useState } from 'react'
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Image, Power, Volume2, Wifi } from 'lucide-react'
import Calendrier from './Calendrier'
import type { Appli, AppliId } from '../applis/applis'
import { useEnLecture } from '../applis/musique/etat'
import Lanceur from '../lanceur/Lanceur'
import { useBatterie } from './useBatterie'
import { useHeure } from './useHeure'
import './Barre.css'

const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

type Props = {
  // Fenêtre active, affichée au centre à côté de la recherche
  active: Appli | null
  // Ouvre une appli depuis le lanceur
  onLancer: (appli: AppliId) => void
  // Ouvre le sélecteur de fond d'écran
  onFonds: () => void
  // Active la fenêtre de musique (clic sur l'indicateur « en lecture »)
  onMusique: () => void
}

// Barre système flottante, façon Waybar : heure à gauche, recherche et fenêtre active au centre, icônes système à droite
export default function Barre({ active, onLancer, onFonds, onMusique }: Props) {
  const maintenant = useHeure()
  const batterie = useBatterie()
  const enLecture = useEnLecture()
  const [calendrier, setCalendrier] = useState(false)
  const [lanceur, setLanceur] = useState(false)
  const zoneHeure = useRef<HTMLDivElement>(null)

  // Le calendrier se ferme avec Échap ou un clic ailleurs
  useEffect(() => {
    if (!calendrier) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Échap ferme le calendrier, sans être transmis à la scène 3D (voir liaison.ts)
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

      <div className="barre-centre">
        <Lanceur ouvert={lanceur} onOuvert={setLanceur} onLancer={onLancer} active={active} />
      </div>

      <div className="barre-droite">
        {enLecture && (
          <button className="barre-icone barre-musique" onClick={onMusique} title="Musique en cours" aria-label="Musique en cours">
            <span /><span /><span />
          </button>
        )}
        <button className="barre-icone" onClick={onFonds} title="Fond d'écran" aria-label="Fond d'écran">
          <Image {...icone} />
        </button>
        <span className="barre-icone" title="Réseau"><Wifi {...icone} /></span>
        <span className="barre-icone" title="Volume"><Volume2 {...icone} /></span>
        {batterie && (
          <span
            className={`barre-batterie${batterie.niveau < 0.2 && !batterie.enCharge ? ' barre-faible' : ''}`}
            title={batterie.enCharge ? 'En charge' : 'Sur batterie'}
          >
            <IconeBatterie niveau={batterie.niveau} enCharge={batterie.enCharge} />
            {Math.round(batterie.niveau * 100)}{'\u202f'}%
          </span>
        )}
        <span className="barre-icone" title="Alimentation"><Power {...icone} /></span>
      </div>
    </header>
  )
}

// Icônes Lucide de la barre : 16 px, couleur du texte
const icone = { size: 16, 'aria-hidden': true } as const

// Batterie : en charge, ou plus ou moins pleine selon le niveau (0 à 1)
function IconeBatterie({ niveau, enCharge }: { niveau: number; enCharge: boolean }) {
  const Icone = enCharge ? BatteryCharging : niveau > 0.7 ? BatteryFull : niveau > 0.4 ? BatteryMedium : niveau > 0.15 ? BatteryLow : BatteryWarning
  return <Icone size={18} aria-hidden />
}
