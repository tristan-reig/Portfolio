import { useLayoutEffect, useRef, useState } from 'react'
import { infosAppli } from '../applis/applis'
import { disposer } from './disposition'
import type { Fenetre } from './useFenetres'
import './Fenetres.css'

type Props = {
  fenetres: Fenetre[]
  active: number | null
  onActiver: (id: number) => void
  onFermer: (id: number) => void
}

function useTaille() {
  const ref = useRef<HTMLDivElement>(null)
  const [taille, setTaille] = useState({ largeur: 0, hauteur: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observateur = new ResizeObserver(([e]) =>
      setTaille({ largeur: e.contentRect.width, hauteur: e.contentRect.height }),
    )
    observateur.observe(el)
    return () => observateur.disconnect()
  }, [])
  return [ref, taille] as const
}

export default function Fenetres({ fenetres, active, onActiver, onFermer }: Props) {
  const [zone, taille] = useTaille()
  const placees = fenetres.filter((f) => !f.fermeture)
  const rects = disposer(placees.length, { x: 0, y: 0, ...taille })

  return (
    <div className="fenetres" ref={zone}>
      {fenetres.map((f) => {
        const { titre, Contenu } = infosAppli(f.appli)
        const i = placees.indexOf(f)
        const r = i >= 0 ? rects[i] : null
        return (
          <section
            key={f.id}
            className={`fenetre${f.id === active ? ' fenetre-active' : ''}${f.fermeture ? ' fenetre-fermeture' : ''}`}
            style={r ? { left: r.x, top: r.y, width: r.largeur, height: r.hauteur } : undefined}
            onPointerDown={() => onActiver(f.id)}
            aria-label={titre}
          >
            <button
              className="fenetre-fermer"
              onClick={(e) => {
                e.stopPropagation()
                onFermer(f.id)
              }}
              aria-label={`Fermer ${titre}`}
              title="Fermer"
            >
              x
            </button>
            <div className="fenetre-contenu">
              <Contenu />
            </div>
          </section>
        )
      })}
    </div>
  )
}
