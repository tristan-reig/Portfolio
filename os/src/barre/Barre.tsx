import { IconeAlimentation, IconeBatterie, IconeEclair, IconeReseau, IconeVolume } from './Icones'
import { useBatterie } from './useBatterie'
import { useHeure } from './useHeure'
import './Barre.css'

const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

export default function Barre() {
  const maintenant = useHeure()
  const batterie = useBatterie()

  return (
    <header className="barre">
      <time className="barre-gauche" dateTime={maintenant.toISOString()}>
        <span>{formatHeure.format(maintenant)}</span>
        <span className="barre-doux">{formatDate.format(maintenant)}</span>
      </time>

      {/* Réservé au titre de la fenêtre active */}
      <div className="barre-centre" />

      <div className="barre-droite">
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
