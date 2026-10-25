import { useHorloge } from '../hooks/useHorloge'
import { PROFIL } from '../config/profil'
import './Hud.css'

type Props = {
  focus: boolean
  verrou: boolean
  onRetour: () => void
  onCamera: () => void
}

// Informations en haut à gauche, par-dessus la scène
export default function Hud({ focus, verrou, onRetour, onCamera }: Props) {
  const heure = useHorloge()

  return (
    <div className="hud">
      <div className="hud-bloc">{PROFIL.nom}</div>
      <div className="hud-bloc">{PROFIL.titre}</div>

      <div className="hud-ligne">
        <div className="hud-bloc hud-heure">{heure}</div>
        <button
          className={`hud-bloc hud-bouton hud-icone${verrou ? ' hud-actif' : ''}`}
          onClick={onCamera}
          disabled={focus}
          aria-pressed={verrou}
          aria-label="Verrouiller la caméra"
          title={verrou ? 'Déverrouiller la caméra' : 'Verrouiller la caméra'}
        >
          <IconeCamera />
        </button>
      </div>

      {focus && (
        <button className="hud-bloc hud-bouton" onClick={onRetour}>
          ← Retour
        </button>
      )}
    </div>
  )
}

function IconeCamera() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M3 6h11a1 1 0 0 1 1 1v3.2l5-3.2v10l-5-3.2V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    </svg>
  )
}
