import { useState } from 'react'
import { useProgress } from '@react-three/drei'
import './Chargement.css'

// Écran de chargement : affiche la progression, puis s'efface tout seul quand la scène est prête
export default function Chargement() {
  const { progress, active } = useProgress()
  const pret = !active && progress === 100
  const [parti, setParti] = useState(false)

  if (parti) return null

  return (
    <div className={`chargement${pret ? ' chargement-fini' : ''}`} onTransitionEnd={() => pret && setParti(true)}>
      <div className="chargement-bloc" role="status">
        Chargement {Math.round(progress)} %
      </div>
    </div>
  )
}
