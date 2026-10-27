import { useEffect, useRef, useState } from 'react'
import { COULEURS, FONDS, type Couleur, type Fond } from './fonds'
import './SelecteurFonds.css'

type Props = {
  actuel: Fond
  onChoisir: (fond: Fond) => void
  onFermer: () => void
}

const CENTRE = { largeur: 460, hauteur: 300 }
const COTE = { largeur: 120, ecart: 10, hauteurMax: 260, perteHauteur: 16 }
const VISIBLES = 5

function placement(decalage: number) {
  if (decalage === 0) return { x: 0, ...CENTRE, opacite: 1 }
  const n = Math.abs(decalage)
  const x = Math.sign(decalage) * (CENTRE.largeur / 2 + COTE.ecart + (n - 1) * (COTE.largeur + COTE.ecart) + COTE.largeur / 2)
  return {
    x,
    largeur: COTE.largeur,
    hauteur: COTE.hauteurMax - (n - 1) * COTE.perteHauteur,
    opacite: n > VISIBLES ? 0 : 1 - (n - 1) * 0.12,
  }
}

// Découpe en parallélogramme
const PENTE = 0.22
const parallelogramme = (hauteur: number) => {
  const d = Math.round(hauteur * PENTE)
  return `polygon(${d}px 0, 100% 0, calc(100% - ${d}px) 100%, 0 100%)`
}

export default function SelecteurFonds({ actuel, onChoisir, onFermer }: Props) {
  const [filtre, setFiltre] = useState<Couleur | null>(null)
  const liste = filtre ? FONDS.filter((f) => f.couleur === filtre) : FONDS
  const [index, setIndex] = useState(() => Math.max(0, FONDS.indexOf(actuel)))
  const actif = Math.min(index, Math.max(0, liste.length - 1))

  // Clavier : flèches pour parcourir, Entrée pour appliquer, Échap pour fermer
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIndex(Math.max(0, actif - 1))
      else if (e.key === 'ArrowRight') setIndex(Math.min(liste.length - 1, actif + 1))
      else if (e.key === 'Enter' && liste[actif]) {
        onChoisir(liste[actif])
        onFermer()
      }
      else if (e.key === 'Escape') onFermer()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [liste, actif, onChoisir, onFermer])

  const derniereMolette = useRef(0)
  const surMolette = (e: React.WheelEvent) => {
    const maintenant = performance.now()
    if (maintenant - derniereMolette.current < 120) return
    derniereMolette.current = maintenant
    const pas = Math.sign(e.deltaY || e.deltaX)
    setIndex(Math.min(liste.length - 1, Math.max(0, actif + pas)))
  }

  const filtrer = (c: Couleur) => {
    const nouveau = filtre === c ? null : c
    setFiltre(nouveau)
    const nouvelleListe = nouveau ? FONDS.filter((f) => f.couleur === nouveau) : FONDS
    setIndex(Math.max(0, nouvelleListe.indexOf(actuel)))
  }

  return (
    <div className="selecteur" onClick={onFermer} onWheel={surMolette}>
      <div className="selecteur-couleurs" onClick={(e) => e.stopPropagation()} role="toolbar" aria-label="Filtrer par couleur">
        {(Object.keys(COULEURS) as Couleur[]).map((c) => (
          <button
            key={c}
            className={`selecteur-couleur${filtre === c ? ' selecteur-couleur-active' : ''}`}
            style={{ background: COULEURS[c] }}
            onClick={() => filtrer(c)}
            aria-pressed={filtre === c}
            aria-label={c}
            title={c.charAt(0).toUpperCase() + c.slice(1)}
          />
        ))}
      </div>

      <div className="selecteur-cartes">
        {liste.length === 0 && <p className="selecteur-vide">Aucun fond de cette couleur</p>}
        {liste.map((f, i) => {
          const p = placement(i - actif)
          return (
            <button
              key={f.id}
              className={`selecteur-carte${f.id === actuel.id ? ' selecteur-carte-choisie' : ''}`}
              style={{
                width: p.largeur,
                height: p.hauteur,
                transform: `translate(-50%, -50%) translateX(${p.x}px)`,
                opacity: p.opacite,
                zIndex: 100 - Math.abs(i - actif),
                background: f.fond,
                clipPath: parallelogramme(p.hauteur),
                pointerEvents: p.opacite === 0 ? 'none' : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (i === actif) {
                  onChoisir(f)
                  onFermer()
                } else {
                  setIndex(i)
                }
              }}
              aria-label={f.nom}
              title={f.nom}
            />
          )
        })}
      </div>
    </div>
  )
}
