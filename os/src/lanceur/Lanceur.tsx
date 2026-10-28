import { useEffect, useRef, useState } from 'react'
import { toutesLesApplis, type Appli, type AppliId } from '../applis/applis'
import './Lanceur.css'

type Props = {
  ouvert: boolean
  onOuvert: (ouvert: boolean) => void
  onLancer: (appli: AppliId) => void
  // Fenêtre active : son titre s'affiche à côté du bouton de recherche
  active: Appli | null
}

// Nombre d'applis par ligne de la grille (le même que dans Lanceur.css)
const COLONNES = 5

// Sans accents ni majuscules, pour que « musiq » trouve « Musique » et « a propos » trouve « À propos »
const simplifier = (texte: string) => texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Lanceur d'applis, au centre de la barre : un champ de recherche qui déroule une grille d'icônes
export default function Lanceur({ ouvert, onOuvert, onLancer, active }: Props) {
  // Ctrl K (ou ⌘ K) ouvre et ferme le lanceur, depuis n'importe où dans l'OS
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'k' || e.repeat) return
      e.preventDefault()
      onOuvert(!ouvert)
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [ouvert, onOuvert])

  if (ouvert) return <Recherche onFermer={() => onOuvert(false)} onLancer={onLancer} />

  return (
    <div className="lanceur">
      {active && (
        <span className="lanceur-actif">
          <span className="lanceur-pastille" style={{ background: active.couleur }} />
          <span className="lanceur-actif-titre">{active.titre}</span>
        </span>
      )}
      <button
        className={`lanceur-champ${active ? ' lanceur-champ-compact' : ''}`}
        onClick={() => onOuvert(true)}
        aria-label="Rechercher une appli"
        title="Rechercher une appli"
      >
        <IconeLoupe />
        {!active && <span className="lanceur-invite">Rechercher une appli…</span>}
        <kbd>Ctrl K</kbd>
      </button>
    </div>
  )
}

// Lanceur ouvert : le champ de saisie dans la barre et le panneau des applis en dessous.
// Monté à chaque ouverture, il repart d'une recherche vide.
function Recherche({ onFermer, onLancer }: { onFermer: () => void; onLancer: (appli: AppliId) => void }) {
  const [recherche, setRecherche] = useState('')
  const [choix, setChoix] = useState(0)
  const zone = useRef<HTMLDivElement>(null)
  const champ = useRef<HTMLInputElement>(null)

  const termes = simplifier(recherche.trim())
  const applis = toutesLesApplis().filter(([, a]) => simplifier(`${a.titre} ${a.description}`).includes(termes))
  const selection = Math.min(choix, Math.max(0, applis.length - 1))
  const choisie = applis[selection]?.[1]

  useEffect(() => champ.current?.focus(), [])

  // Un clic en dehors du champ et du panneau ferme le lanceur
  useEffect(() => {
    const surClic = (e: PointerEvent) => {
      if (!zone.current?.contains(e.target as Node)) onFermer()
    }
    window.addEventListener('pointerdown', surClic)
    return () => window.removeEventListener('pointerdown', surClic)
  }, [onFermer])

  const ouvrir = (id: AppliId) => {
    onLancer(id)
    onFermer()
  }

  // Déplacement dans la grille, sans sortir de la liste
  const deplacer = (pas: number) => {
    const suivant = selection + pas
    if (suivant >= 0 && suivant < applis.length) setChoix(suivant)
  }

  const surTouche = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') deplacer(1)
    else if (e.key === 'ArrowLeft') deplacer(-1)
    else if (e.key === 'ArrowDown') deplacer(COLONNES)
    else if (e.key === 'ArrowUp') deplacer(-COLONNES)
    else if (e.key === 'Enter' && applis[selection]) ouvrir(applis[selection][0])
    // Échap ferme le lanceur, sans être transmis à la scène 3D (voir liaison.ts)
    else if (e.key === 'Escape') onFermer()
    else return
    e.preventDefault()
  }

  return (
    <div className="lanceur" ref={zone}>
      <label className="lanceur-champ lanceur-champ-ouvert">
        <IconeLoupe />
        <input
          ref={champ}
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value)
            setChoix(0)
          }}
          onKeyDown={surTouche}
          placeholder="Rechercher une appli…"
          aria-label="Rechercher une appli"
          spellCheck={false}
        />
        <kbd>esc</kbd>
      </label>

      <div className="lanceur-panneau" role="dialog" aria-label="Applis">
        {applis.length === 0 ? (
          <p className="lanceur-vide">Aucune appli ne correspond</p>
        ) : (
          <ul className="lanceur-grille" role="listbox" aria-label="Applis">
            {applis.map(([id, a], i) => (
              <li key={id}>
                <button
                  className={`lanceur-appli${i === selection ? ' lanceur-appli-choisie' : ''}`}
                  role="option"
                  aria-selected={i === selection}
                  onPointerEnter={() => setChoix(i)}
                  onPointerDown={(e) => e.preventDefault()} // le champ garde le focus pour le clavier
                  onClick={() => ouvrir(id)}
                  style={{ '--couleur': a.couleur } as React.CSSProperties}
                >
                  <span className="lanceur-icone"><a.Icone /></span>
                  <span className="lanceur-titre">{a.titre}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="lanceur-pied">
          <span className="lanceur-info">
            {choisie && (
              <>
                <strong>{choisie.titre}</strong> {choisie.description}
              </>
            )}
          </span>
          <span className="lanceur-touches" aria-hidden="true">
            <kbd>←↑↓→</kbd>
            <kbd>↵</kbd>
          </span>
        </footer>
      </div>
    </div>
  )
}

function IconeLoupe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
