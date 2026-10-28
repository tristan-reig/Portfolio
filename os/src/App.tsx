import { useState } from 'react'
import Barre from './barre/Barre'
import Fenetres from './fenetres/Fenetres'
import { useFenetres } from './fenetres/useFenetres'
import SelecteurFonds from './fonds/SelecteurFonds'
import { useFond } from './fonds/useFond'
import { AU_DEMARRAGE, infosAppli } from './applis/applis'

export default function App() {
  const [fond, choisirFond] = useFond()
  const [selecteur, setSelecteur] = useState(false)
  const { fenetres, active, fermer, activer } = useFenetres(AU_DEMARRAGE)

  const fenetreActive = fenetres.find((f) => f.id === active)
    const titre = fenetreActive ? infosAppli(fenetreActive.appli).titre : ''

  return (
    <div className="bureau" style={{ background: fond.fond }}>
      <Fenetres fenetres={fenetres} active={active} onActiver={activer} onFermer={fermer} />
      <Barre
        titre={titre}
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
