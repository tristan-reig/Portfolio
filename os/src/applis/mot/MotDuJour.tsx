import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  chargerDictionnaire, ecrirePartie, ESSAIS, evaluer, jourDuJour, lirePartie, LONGUEUR, motDuJour, normaliser,
  type Couleur, type Langue,
} from './jeu'
import './MotDuJour.css'

const TEXTES = {
  fr: {
    court: 'Pas assez de lettres',
    inconnu: 'Mot inconnu',
    chargement: 'Chargement du dictionnaire…',
    bravo: ['Génial !', 'Magnifique !', 'Impressionnant !', 'Bravo !', 'Bien joué !', 'Ouf !'],
    trouve: (n: number) => `Trouvé en ${n} essai${n > 1 ? 's' : ''}`,
    perdu: 'Le mot était',
    prochain: 'Prochain mot dans',
    entree: 'Entrée',
    effacer: 'Effacer',
  },
  en: {
    court: 'Not enough letters',
    inconnu: 'Not in word list',
    chargement: 'Loading word list…',
    bravo: ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'],
    trouve: (n: number) => `Solved in ${n} guess${n > 1 ? 'es' : ''}`,
    perdu: 'The word was',
    prochain: 'Next word in',
    entree: 'Enter',
    effacer: 'Delete',
  },
}

const CLAVIERS = {
  fr: ['AZERTYUIOP', 'QSDFGHJKLM', '↵WXCVBN⌫'],
  en: ['QWERTYUIOP', 'ASDFGHJKL', '↵ZXCVBNM⌫'],
}

const PRIORITE: Record<Couleur, number> = { absent: 1, present: 2, bien: 3 }
const DUREE_RETOURNEMENT = 300 // ms entre deux lettres, la même que dans MotDuJour.css
// Fin du retournement de la dernière lettre (elle part à 4 × 300 ms et dure 500 ms)
const FIN_RETOURNEMENT = DUREE_RETOURNEMENT * (LONGUEUR - 1) + 500

function lireLangue(): Langue {
  try {
    return localStorage.getItem('mot-langue') === 'en' ? 'en' : 'fr'
  } catch {
    return 'fr'
  }
}

// Wordle : un mot de 5 lettres à trouver en 6 essais, le même pour tous chaque jour
export default function MotDuJour() {
  const [langue, setLangue] = useState<Langue>(lireLangue)
  const [jour, setJour] = useState(jourDuJour)
  const [essais, setEssais] = useState(() => lirePartie(langue, jour).essais)
  // Essais déjà dévoilés : le clavier ne se colore qu'une fois les lettres retournées
  const [devoiles, setDevoiles] = useState(essais.length)
  const [saisie, setSaisie] = useState('')
  const [dico, setDico] = useState<{ langue: Langue; mots: Set<string> } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [secoue, setSecoue] = useState(false)
  const [revelee, setRevelee] = useState<number | null>(null) // ligne qui vient d'être jouée, pour l'animation
  const cadre = useRef<HTMLDivElement>(null)
  const minuteurs = useRef<number[]>([])

  const t = TEXTES[langue]
  const solution = motDuJour(langue, jour)
  const gagne = essais.at(-1) === solution
  const fini = gagne || essais.length >= ESSAIS
  const enCours = devoiles < essais.length // une ligne est en train de se retourner

  // Minuteurs liés à la partie en cours : annulés si on change de langue ou de jour
  const plusTard = (action: () => void, ms: number) => minuteurs.current.push(window.setTimeout(action, ms))
  const annulerMinuteurs = () => {
    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []
  }
  useEffect(() => annulerMinuteurs, [])

  // Charge une partie (changement de langue ou nouveau jour)
  const chargerPartie = (l: Langue, j: number) => {
    annulerMinuteurs()
    const e = lirePartie(l, j).essais
    setEssais(e)
    setDevoiles(e.length)
    setSaisie('')
    setRevelee(null)
    setMessage(null)
  }

  // Dictionnaire de la langue choisie, puis celui de l'autre en avance pour un changement instantané
  useEffect(() => {
    let annule = false
    chargerDictionnaire(langue).then((mots) => {
      if (!annule) setDico({ langue, mots })
      chargerDictionnaire(langue === 'fr' ? 'en' : 'fr')
    })
    return () => {
      annule = true
    }
  }, [langue])

  const afficher = useCallback((texte: string, duree = 1500) => {
    setMessage(texte)
    window.setTimeout(() => setMessage((m) => (m === texte ? null : m)), duree)
  }, [])

  const changerLangue = (l: Langue) => {
    if (l === langue) return
    try {
      localStorage.setItem('mot-langue', l)
    } catch {
      // sans stockage, le choix vaut pour cette visite
    }
    setLangue(l)
    chargerPartie(l, jour)
  }

  const valider = () => {
    if (fini || enCours) return
    if (dico?.langue !== langue) {
      afficher(t.chargement)
      return
    }
    if (saisie.length < LONGUEUR) {
      afficher(t.court)
      setSecoue(true)
      return
    }
    if (!dico.mots.has(saisie)) {
      afficher(t.inconnu)
      setSecoue(true)
      return
    }
    const suivants = [...essais, saisie]
    setEssais(suivants)
    setSaisie('')
    setRevelee(suivants.length - 1)
    ecrirePartie(langue, { jour, essais: suivants })

    plusTard(() => {
      setDevoiles(suivants.length)
      if (saisie === solution) afficher(t.bravo[suivants.length - 1], 1800)
      else if (suivants.length >= ESSAIS) afficher(`${t.perdu} ${solution}`, 3000)
    }, FIN_RETOURNEMENT)
  }

  const taper = (touche: string) => {
    if (fini) return
    if (touche === '↵') valider()
    else if (touche === '⌫') setSaisie((s) => s.slice(0, -1))
    else setSaisie((s) => (s.length < LONGUEUR ? s + touche : s))
  }

  // Clavier physique, seulement quand la fenêtre du jeu est active (lettres accentuées acceptées : é → E)
  const taperRef = useRef(taper)
  useEffect(() => {
    taperRef.current = taper
  })
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (!cadre.current?.closest('.fenetre-active')) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Enter') taperRef.current('↵')
      else if (e.key === 'Backspace') taperRef.current('⌫')
      else if (/^\p{L}$/u.test(e.key) && /^[A-Z]$/.test(normaliser(e.key))) taperRef.current(normaliser(e.key))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [])

  // Nouveau jour pendant que la fenêtre est ouverte : nouvelle partie
  const chargerRef = useRef(chargerPartie)
  useEffect(() => {
    chargerRef.current = chargerPartie
  })
  useEffect(() => {
    const minuteur = window.setInterval(() => {
      const j = jourDuJour()
      if (j === jour) return
      setJour(j)
      chargerRef.current(langue, j)
    }, 1000)
    return () => clearInterval(minuteur)
  }, [jour, langue])

  // Couleur de chaque touche du clavier : la meilleure information obtenue sur les essais dévoilés
  const touches = useMemo(() => {
    const c = new Map<string, Couleur>()
    essais.slice(0, devoiles).forEach((e) =>
      evaluer(e, solution).forEach((couleur, i) => {
        const avant = c.get(e[i])
        if (!avant || PRIORITE[couleur] > PRIORITE[avant]) c.set(e[i], couleur)
      }),
    )
    return c
  }, [essais, devoiles, solution])

  return (
    <div className="mot-cadre" ref={cadre}>
      <div className="mot">
        <header className="mot-entete">
          <h1>
            Wordle <span className="mot-numero">n°{jour + 1}</span>
          </h1>
          <div className="mot-langues" role="group" aria-label="Langue">
            {(['fr', 'en'] as const).map((l) => (
              <button
                key={l}
                className={l === langue ? 'mot-langue-active' : ''}
                onClick={() => changerLangue(l)}
                onPointerDown={(e) => e.preventDefault()}
                aria-pressed={l === langue}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <div className="mot-grille" role="grid" aria-label="Wordle">
          {Array.from({ length: ESSAIS }, (_, ligne) => {
            const joue = essais[ligne]
            const mot = joue ?? (ligne === essais.length ? saisie : '')
            const couleurs = joue ? evaluer(joue, solution) : null
            const classes = ['mot-ligne']
            if (ligne === essais.length && secoue) classes.push('mot-secoue')
            const victoire = gagne && ligne === essais.length - 1 && revelee === ligne
            if (victoire) classes.push('mot-victoire')
            return (
              <div key={ligne} className={classes.join(' ')} role="row" onAnimationEnd={() => setSecoue(false)}>
                {Array.from({ length: LONGUEUR }, (_, i) => {
                  const lettre = mot[i] ?? ''
                  const anime = couleurs && revelee === ligne
                  return (
                    <div
                      key={i}
                      role="gridcell"
                      className={`mot-case${lettre && !couleurs ? ' mot-case-pleine' : ''}${couleurs ? ` mot-${couleurs[i]}` : ''}${anime ? ' mot-retourne' : ''}`}
                      // Ligne gagnante : les délais (retournement puis saut) sont dans le CSS
                      style={anime && !victoire ? { animationDelay: `${i * DUREE_RETOURNEMENT}ms` } : undefined}
                    >
                      {lettre}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Partie terminée (et dernière ligne retournée) : le résultat et le compte à rebours remplacent le clavier */}
        {fini && !enCours ? (
          <div className="mot-fin">
            <p className={gagne ? 'mot-fin-gagne' : undefined}>
              {gagne ? t.trouve(essais.length) : <>{t.perdu} <strong>{solution}</strong></>}
            </p>
            <Compte texte={t.prochain} />
          </div>
        ) : (
          <div className="mot-clavier">
            {CLAVIERS[langue].map((rangee) => (
              <div key={rangee} className="mot-rangee">
                {[...rangee].map((touche) => {
                  const c = touches.get(touche)
                  const large = touche === '↵' || touche === '⌫'
                  return (
                    <button
                      key={touche}
                      className={`mot-touche${large ? ' mot-touche-large' : ''}${c ? ` mot-${c}` : ''}`}
                      onClick={() => taper(touche)}
                      onPointerDown={(e) => e.preventDefault()} // pas de focus : Entrée au clavier ne recliquerait pas la touche
                      aria-label={touche === '↵' ? t.entree : touche === '⌫' ? t.effacer : touche}
                    >
                      {touche === '↵' ? t.entree : touche === '⌫' ? <IconeEffacer /> : touche}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {message && <div className="mot-message" role="status">{message}</div>}
      </div>
    </div>
  )
}

// Compte à rebours jusqu'à minuit (le prochain mot)
function Compte({ texte }: { texte: string }) {
  const [maintenant, setMaintenant] = useState(() => new Date())
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(new Date()), 1000)
    return () => clearInterval(minuteur)
  }, [])
  const minuit = new Date(maintenant)
  minuit.setHours(24, 0, 0, 0)
  const reste = Math.max(0, Math.floor((minuit.getTime() - maintenant.getTime()) / 1000))
  const deux = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="mot-compte">
      <span>{texte}</span>
      <strong>{deux(Math.floor(reste / 3600))}:{deux(Math.floor((reste % 3600) / 60))}:{deux(reste % 60)}</strong>
    </div>
  )
}

function IconeEffacer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
      <path d="m17 9-6 6M11 9l6 6" />
    </svg>
  )
}
