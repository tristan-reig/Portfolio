import { useEffect, useState } from 'react'
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, Volume2, Wifi } from 'lucide-react'
import { useBatterie } from '../barre/useBatterie'
import { useHeure } from '../barre/useHeure'
import { deverrouiller } from './etat'
import './Verrouillage.css'

const NOM = 'Tristan Reig'
const INITIALES = 'TR'

const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

const DUREE_SORTIE = 650

// Écran de verrouillage façon macOS / Hyprlock : le bureau flouté derrière, une barre minimale,
// la date et l'heure en haut, l'utilisateur en bas. Pas de mot de passe : Entrée (ou un clic) déverrouille.
export default function Verrouillage() {
  const maintenant = useHeure()
  const batterie = useBatterie()
  const [sortie, setSortie] = useState(false)

  useEffect(() => {
    // Le champ ou le bouton qui avait le focus derrière ne reçoit plus le clavier
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()

    // Toutes les touches s'arrêtent ici (les applis derrière ignorent une touche déjà traitée),
    // sauf Échap qui permet toujours de quitter l'écran dans la scène 3D
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return
      e.preventDefault()
      if (e.key === 'Enter') setSortie(true)
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [])

  // L'écran remonte, puis disparaît
  useEffect(() => {
    if (!sortie) return
    const minuteur = window.setTimeout(deverrouiller, DUREE_SORTIE)
    return () => clearTimeout(minuteur)
  }, [sortie])

  const IconeBatterie = !batterie
    ? null
    : batterie.enCharge
      ? BatteryCharging
      : batterie.niveau > 0.7
        ? BatteryFull
        : batterie.niveau > 0.4
          ? BatteryMedium
          : batterie.niveau > 0.15
            ? BatteryLow
            : BatteryWarning

  return (
    <div
      className={`verrou${sortie ? ' verrou-sortie' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Écran verrouillé. Appuyez sur Entrée pour déverrouiller."
      onClick={() => setSortie(true)}
    >
      <div className="verrou-barre">
        <Wifi size={16} aria-hidden />
        <Volume2 size={16} aria-hidden />
        {batterie && IconeBatterie && (
          <span className="verrou-batterie">
            <IconeBatterie size={18} aria-hidden />
            {Math.round(batterie.niveau * 100)}{'\u202f'}%
          </span>
        )}
      </div>

      <div className="verrou-heure">
        <p>{formatDate.format(maintenant)}</p>
        <time dateTime={maintenant.toISOString()}>{formatHeure.format(maintenant)}</time>
      </div>

      <div className="verrou-session">
        <div className="verrou-avatar" aria-hidden="true">
          {INITIALES}
        </div>
        <p className="verrou-nom">{NOM}</p>
        <p className="verrou-consigne">Appuyez sur Entrée pour déverrouiller</p>
      </div>
    </div>
  )
}
