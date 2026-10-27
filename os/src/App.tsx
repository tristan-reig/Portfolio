import { useState } from 'react'
import Barre from './barre/Barre'
import SelecteurFonds from './fonds/SelecteurFonds'
import { useFond } from './fonds/useFond'

export default function App() {
  const [fond, choisirFond] = useFond()
  const [selecteur, setSelecteur] = useState(false)

  return (
    <div className="bureau" style={{ background: fond.fond }}>
      <Barre onFonds={() => setSelecteur(true)} />
      {selecteur && (
        <SelecteurFonds actuel={fond} onChoisir={choisirFond} onFermer={() => setSelecteur(false)} />
      )}
    </div>
  )
}
