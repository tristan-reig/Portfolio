import { useState } from 'react'

type Props = {
  valeur: number
  max: number
  onChange?: (valeur: number) => void
  onFin?: (valeur: number) => void
  pas: number
  label: string
  texte?: string
  className?: string
}

export default function Curseur({ valeur, max, onChange, onFin, pas, label, texte, className }: Props) {
  const [glisse, setGlisse] = useState<number | null>(null)
  const affichee = glisse ?? valeur
  const part = max > 0 ? Math.min(1, Math.max(0, affichee / max)) : 0

  const lire = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * max
  }

  const changer = (v: number) => {
    setGlisse(v)
    onChange?.(v)
  }

  return (
    <div
      className={`curseur${glisse !== null ? ' curseur-actif' : ''}${className ? ` ${className}` : ''}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(affichee)}
      aria-valuetext={texte}
      onPointerDown={(e) => {
        if (max <= 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        changer(lire(e))
      }}
      onPointerMove={(e) => {
        if (glisse !== null) changer(lire(e))
      }}
      onPointerUp={(e) => {
        if (glisse === null) return
        onFin?.(lire(e))
        setGlisse(null)
      }}
      onPointerCancel={() => setGlisse(null)}
      onKeyDown={(e) => {
        const sens = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
        if (!sens) return
        e.preventDefault()
        const v = Math.min(max, Math.max(0, valeur + sens * pas))
        onChange?.(v)
        onFin?.(v)
      }}
    >
      <div className="curseur-piste">
        <div className="curseur-rempli" style={{ width: `${part * 100}%` }} />
      </div>
      <div className="curseur-poignee" style={{ left: `${part * 100}%` }} />
    </div>
  )
}
