import { useEffect, useState } from 'react'
import { useHorloge } from '../hooks/useHorloge'
import { useSequenceFrappe } from '../hooks/useFrappe'
import { jouerTouche } from '../audio/clavier'
import { PROFIL } from '../config/profil'
import './Hud.css'

const FRAPPE = {
  debut: 300,
  vitesse: 85,
  variation: 0.6,
  pause: 450,
}

const DELAI_BOUTON = FRAPPE.vitesse

type Props = {
  actif: boolean
  focus: boolean
  verrou: boolean
  onRetour: () => void
  onCamera: () => void
}

export default function Hud({ actif, focus, verrou, onRetour, onCamera }: Props) {
  const heure = useHorloge()

  const { lignes, termine } = useSequenceFrappe([PROFIL.nom, PROFIL.titre, heure], {
    actif,
    ...FRAPPE,
    surLettre: jouerTouche,
  })
  const [nom, titre, horloge] = lignes

  const [boutonVisible, setBoutonVisible] = useState(false)
  useEffect(() => {
    if (!termine) return
    const minuteur = setTimeout(() => {
      setBoutonVisible(true)
      jouerTouche()
    }, DELAI_BOUTON)
    return () => clearTimeout(minuteur)
  }, [termine])

  return (
    <div className="hud">
      {nom.visible && <BlocTexte complet={PROFIL.nom} affiche={nom.texte} />}
      {titre.visible && <BlocTexte complet={PROFIL.titre} affiche={titre.texte} />}

      <div className="hud-ligne">
        {horloge.visible && <BlocTexte complet={heure} affiche={horloge.texte} classe="hud-heure" />}
        {boutonVisible && (
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
        )}
      </div>

      {focus && (
        <button className="hud-bloc hud-bouton" onClick={onRetour}>
          ← Retour
        </button>
      )}
    </div>
  )
}

function BlocTexte({ complet, affiche, classe }: { complet: string; affiche: string; classe?: string }) {
  return (
    <div className={`hud-bloc${classe ? ` ${classe}` : ''}`}>
      <span className="hud-masque">{complet}</span>
      <span aria-hidden="true">{affiche}</span>
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
