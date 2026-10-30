import { useEffect, useRef, useState } from 'react'
import { Lock, Power, RotateCcw } from 'lucide-react'
import './MenuAlimentation.css'

type Props = {
  onVerrouiller?: () => void
  onRedemarrer?: () => void
}

export default function MenuAlimentation({ onVerrouiller, onRedemarrer }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const zone = useRef<HTMLDivElement>(null)
  const entrees = useRef<(HTMLButtonElement | null)[]>([])

  const ENTREES = [
    { nom: 'Verrouiller', Icone: Lock, action: onVerrouiller },
    { nom: 'Redémarrer', Icone: RotateCcw, action: onRedemarrer },
  ]

  useEffect(() => {
    if (!ouvert) return
    entrees.current[0]?.focus()
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOuvert(false)
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const liste = entrees.current.filter((b) => b !== null)
        const i = liste.indexOf(document.activeElement as HTMLButtonElement)
        const pas = e.key === 'ArrowDown' ? 1 : -1
        liste[(i + pas + liste.length) % liste.length]?.focus()
      }
    }
    const surClic = (e: PointerEvent) => {
      if (!zone.current?.contains(e.target as Node)) setOuvert(false)
    }
    window.addEventListener('keydown', surTouche, true)
    window.addEventListener('pointerdown', surClic)
    return () => {
      window.removeEventListener('keydown', surTouche, true)
      window.removeEventListener('pointerdown', surClic)
    }
  }, [ouvert])

  return (
    <div className="alimentation" ref={zone}>
      <button
        className={`barre-icone${ouvert ? ' barre-icone-ouverte' : ''}`}
        onClick={() => setOuvert(!ouvert)}
        title="Alimentation"
        aria-label="Alimentation"
        aria-haspopup="menu"
        aria-expanded={ouvert}
      >
        <Power size={16} aria-hidden />
      </button>

      {ouvert && (
        <div className="alimentation-menu" role="menu" aria-label="Alimentation">
          {ENTREES.map(({ nom, Icone, action }, i) => (
            <button
              key={nom}
              ref={(b) => {
                entrees.current[i] = b
              }}
              role="menuitem"
              onClick={() => {
                setOuvert(false)
                action?.()
              }}
            >
              <Icone size={16} aria-hidden />
              {nom}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
