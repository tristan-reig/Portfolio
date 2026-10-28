import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { infosAppli } from '../applis/applis'
import { echelle } from '../zoom'
import { disposer, voisine, type Direction } from './disposition'
import type { Fenetre } from './useFenetres'
import './Fenetres.css'

type Props = {
  fenetres: Fenetre[]
  active: number | null
  onActiver: (id: number) => void
  onFermer: (id: number) => void
  onEchanger: (a: number, b: number) => void
}

const DIRECTIONS: Record<string, Direction> = { ArrowLeft: 'gauche', ArrowRight: 'droite', ArrowUp: 'haut', ArrowDown: 'bas' }

type Glisse = { id: number; x0: number; y0: number; dx: number; dy: number; cible: number | null }

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

const zoneDeTexte = (cible: EventTarget | null) =>
  cible instanceof HTMLElement && (cible.isContentEditable || /^(input|textarea|select)$/i.test(cible.tagName))

export default function Fenetres({ fenetres, active, onActiver, onFermer, onEchanger }: Props) {
  const [zone, taille] = useTaille()
  const [glisse, setGlisse] = useState<Glisse | null>(null)
  const placees = fenetres.filter((f) => !f.fermeture)
  const rects = disposer(placees.length, { x: 0, y: 0, ...taille })

  // Ctrl Maj ←↑↓→ : la fenêtre active échange sa place avec sa voisine dans cette direction
  const echangeRef = useRef<(e: KeyboardEvent) => void>(() => {})
  useEffect(() => {
    echangeRef.current = (e) => {
      const direction = DIRECTIONS[e.key]
      if (!direction || !(e.ctrlKey || e.metaKey) || !e.shiftKey || zoneDeTexte(e.target)) return
      const i = placees.findIndex((f) => f.id === active)
      if (i < 0) return
      e.preventDefault()
      const j = voisine(rects, i, direction)
      if (j !== null) onEchanger(placees[i].id, placees[j].id)
    }
  })
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => echangeRef.current(e)
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [])

  // Glisser-déposer par la poignée
  const commencer = (e: React.PointerEvent, id: number) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    onActiver(id)
    setGlisse({ id, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, cible: null })
  }

  const deplacer = (e: React.PointerEvent) => {
    if (!glisse) return
    const dessous = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map((el) => el.closest<HTMLElement>('.fenetre'))
      .find((el) => el && Number(el.dataset.id) !== glisse.id && !el.classList.contains('fenetre-fermeture'))
    setGlisse({
      ...glisse,
      dx: (e.clientX - glisse.x0) / echelle(),
      dy: (e.clientY - glisse.y0) / echelle(),
      cible: dessous ? Number(dessous.dataset.id) : null,
    })
  }

  const lacher = () => {
    if (glisse?.cible != null) onEchanger(glisse.id, glisse.cible)
    setGlisse(null)
  }

  const affichees = [...fenetres].sort((a, b) => a.id - b.id)

  return (
    <div className="fenetres" ref={zone}>
      {placees.length === 0 && (
        <div className="fenetres-vide">
          <p>Aucune fenêtre ouverte</p>
          <p className="fenetres-vide-aide">
            Utilise la recherche en haut, ou <kbd>Ctrl K</kbd>
          </p>
        </div>
      )}
      {affichees.map((f) => {
        const { titre, Contenu } = infosAppli(f.appli)
        const i = placees.indexOf(f)
        const r = i >= 0 ? rects[i] : null
        const glissee = glisse?.id === f.id
        const classes = ['fenetre']
        if (f.id === active) classes.push('fenetre-active')
        if (f.fermeture) classes.push('fenetre-fermeture')
        if (glissee) classes.push('fenetre-glissee')
        if (glisse?.cible === f.id) classes.push('fenetre-cible')
        return (
          <section
            key={f.id}
            data-id={f.id}
            className={classes.join(' ')}
            style={{
              ...(r && { left: r.x, top: r.y, width: r.largeur, height: r.hauteur }),
              ...(glissee && { transform: `translate(${glisse.dx}px, ${glisse.dy}px) scale(0.96)`, transition: 'none' }),
            }}
            onPointerDown={() => onActiver(f.id)}
            aria-label={titre}
          >
            {placees.length > 1 && (
              <div
                className="fenetre-poignee"
                onPointerDown={(e) => commencer(e, f.id)}
                onPointerMove={deplacer}
                onPointerUp={lacher}
                onPointerCancel={() => setGlisse(null)}
                title="Glisser sur une autre fenêtre pour les échanger (ou Ctrl Maj ←↑↓→)"
              >
                <span />
              </div>
            )}
            <button
              className="fenetre-fermer"
              onClick={(e) => {
                e.stopPropagation()
                onFermer(f.id)
              }}
              aria-label={`Fermer ${titre}`}
              title="Fermer"
            >
              ×
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
