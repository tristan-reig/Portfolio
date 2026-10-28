import { useRef } from 'react'
import { echelle } from '../../zoom'

type Props = {
  hauteur: number
  min: number
  max: () => number
  onChange: (hauteur: number) => void
  label: string
}

// Poignée horizontale entre deux panneaux : glisser vers le haut ou le bas, ou flèches du clavier
export default function Separateur({ hauteur, min, max, onChange, label }: Props) {
  const depart = useRef<{ y: number; hauteur: number } | null>(null)
  const borner = (h: number) => Math.min(max(), Math.max(min, h))

  return (
    <div
      className="separateur"
      role="separator"
      aria-orientation="horizontal"
      aria-label={label}
      aria-valuenow={Math.round(hauteur)}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        depart.current = { y: e.clientY, hauteur }
      }}
      onPointerMove={(e) => {
        if (depart.current) onChange(borner(depart.current.hauteur + (e.clientY - depart.current.y) / echelle()))
      }}
      onPointerUp={() => (depart.current = null)}
      onPointerCancel={() => (depart.current = null)}
      onKeyDown={(e) => {
        const pas = e.key === 'ArrowDown' ? 24 : e.key === 'ArrowUp' ? -24 : 0
        if (!pas) return
        e.preventDefault()
        onChange(borner(hauteur + pas))
      }}
    >
      <span />
    </div>
  )
}
