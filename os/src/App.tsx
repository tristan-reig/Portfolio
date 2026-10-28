import { useState } from 'react'
import { AU_DEMARRAGE, infosAppli, type AppliId } from './applis/applis'
import Barre from './barre/Barre'
import Fenetres from './fenetres/Fenetres'
import { useFenetres } from './fenetres/useFenetres'
import SelecteurFonds from './fonds/SelecteurFonds'
import { useFond } from './fonds/useFond'

export default function App() {
  const [fond, choisirFond] = useFond()
  const [selecteur, setSelecteur] = useState(false)
  const { fenetres, active, ouvrir, fermer, activer, echanger } = useFenetres(AU_DEMARRAGE)

  const lancer = (appli: AppliId) => {
    const ouverte = fenetres.find((f) => f.appli === appli && !f.fermeture)
    if (ouverte) activer(ouverte.id)
    else ouvrir(appli)
  }

  const fenetreActive = fenetres.find((f) => f.id === active && !f.fermeture)

  return (
    <div className="bureau" style={{ background: fond.fond }}>
      <Fenetres fenetres={fenetres} active={active} onActiver={activer} onFermer={fermer} onEchanger={echanger} />
      <Barre
        active={fenetreActive ? infosAppli(fenetreActive.appli) : null}
        onLancer={lancer}
        onFonds={() => setSelecteur(true)}
        onMusique={() => {
          const musique = fenetres.find((f) => f.appli === 'musique' && !f.fermeture)
          if (musique) activer(musique.id)
        }}
      />
      {selecteur && (
        <SelecteurFonds actuel={fond} onChoisir={choisirFond} onFermer={() => setSelecteur(false)} />
      )}
    </div>
  )
}
