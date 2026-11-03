import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { GRILLES, type Groupe } from './grilles'
import './Connexions.css'

const ERREURS_MAX = 4
const DUREE_SAUT = 450

// Progression de chaque grille, gardée dans le navigateur du visiteur
type Partie = { trouves: number[]; erreurs: number; essais: string[] }
const PARTIE_VIDE: Partie = { trouves: [], erreurs: 0, essais: [] }
const CLE = 'connexions-parties'

function lireParties(): Record<number, Partie> {
  try {
    return JSON.parse(localStorage.getItem(CLE) ?? '{}')
  } catch {
    return {}
  }
}

function ecrireParties(parties: Record<number, Partie>) {
  try {
    localStorage.setItem(CLE, JSON.stringify(parties))
  } catch {}
}

const gagnee = (p?: Partie) => !!p && p.trouves.length === 4
const perdue = (p?: Partie) => !!p && p.erreurs >= ERREURS_MAX
const finie = (p?: Partie) => gagnee(p) || perdue(p)

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

// Mots encore en jeu, mélangés
const motsRestants = (grille: number, partie: Partie) =>
  melanger(GRILLES[grille].flatMap((g, i) => (partie.trouves.includes(i) ? [] : g.mots)))

const BRAVO = ['Parfait !', 'Superbe !', 'Bien joué !', 'Ouf !']

export default function Connexions() {
  const [parties, setParties] = useState(lireParties)
  const [numero, setNumero] = useState(() => {
    const p = lireParties()
    const i = GRILLES.findIndex((_, n) => !finie(p[n]))
    return i < 0 ? 0 : i
  })
  const partie = parties[numero] ?? PARTIE_VIDE
  const [ordre, setOrdre] = useState(() => motsRestants(numero, partie))
  const [selection, setSelection] = useState<string[]>([])
  const [saut, setSaut] = useState(false)
  const [secoue, setSecoue] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [liste, setListe] = useState(false)
  const minuteurs = useRef<number[]>([])
  const navigation = useRef<HTMLDivElement>(null)

  const grille = GRILLES[numero]
  const groupeDe = useMemo(() => {
    const m = new Map<string, number>()
    grille.forEach((g, i) => g.mots.forEach((mot) => m.set(mot, i)))
    return m
  }, [grille])

  const fini = finie(partie)
  const bandeaux: Groupe[] = [
    ...partie.trouves.map((i) => grille[i]),
    ...(perdue(partie) ? grille.filter((_, i) => !partie.trouves.includes(i)) : []),
  ]

  useEffect(() => () => minuteurs.current.forEach(clearTimeout), [])

  useEffect(() => {
    if (!liste) return
    const surClic = (e: PointerEvent) => {
      if (!navigation.current?.contains(e.target as Node)) setListe(false)
    }
    window.addEventListener('pointerdown', surClic)
    return () => window.removeEventListener('pointerdown', surClic)
  }, [liste])
  const plusTard = (action: () => void, ms: number) => minuteurs.current.push(window.setTimeout(action, ms))

  const afficher = (texte: string, duree = 1600) => {
    setMessage(texte)
    plusTard(() => setMessage((m) => (m === texte ? null : m)), duree)
  }

  const enregistrer = (p: Partie) => {
    const suite = { ...parties, [numero]: p }
    setParties(suite)
    ecrireParties(suite)
  }

  const ouvrir = (n: number) => {
    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []
    setNumero(n)
    setOrdre(motsRestants(n, parties[n] ?? PARTIE_VIDE))
    setSelection([])
    setSaut(false)
    setMessage(null)
    setListe(false)
  }

  const choisir = (mot: string) => {
    if (fini || saut) return
    setSelection((s) => (s.includes(mot) ? s.filter((m) => m !== mot) : s.length < 4 ? [...s, mot] : s))
  }

  const valider = () => {
    if (selection.length !== 4 || fini || saut) return
    const cle = [...selection].sort().join('|')
    if (partie.essais.includes(cle)) {
      afficher('Déjà essayé')
      return
    }
    setSaut(true)
    plusTard(() => {
      setSaut(false)
      const groupes = selection.map((m) => groupeDe.get(m)!)
      const compte = Math.max(...[0, 1, 2, 3].map((g) => groupes.filter((x) => x === g).length))
      const essais = [...partie.essais, cle]

      if (compte === 4) {
        const trouves = [...partie.trouves, groupes[0]]
        enregistrer({ ...partie, trouves, essais })
        setOrdre((o) => o.filter((m) => !selection.includes(m)))
        setSelection([])
        if (trouves.length === 4) afficher(BRAVO[partie.erreurs], 2400)
        return
      }

      const erreurs = partie.erreurs + 1
      enregistrer({ ...partie, erreurs, essais })
      setSecoue(true)
      if (erreurs >= ERREURS_MAX) {
        setSelection([])
        afficher('Dommage !', 2400)
      } else if (compte === 3) afficher('À un mot près !')
    }, DUREE_SAUT)
  }

  // Prochaine grille pas encore terminée, après celle-ci
  const suivante = [...GRILLES.keys()].map((i) => (numero + 1 + i) % GRILLES.length).find((n) => !finie(parties[n]))

  return (
    <div className="cx-cadre">
      <div className="cx">
        <header className="cx-entete">
          <div>
            <h1>Connections</h1>
            <p>Formez quatre groupes de quatre mots.</p>
          </div>
          <div className="cx-navigation" ref={navigation}>
            <button className="cx-icone" onClick={() => ouvrir(numero - 1)} disabled={numero === 0} aria-label="Grille précédente">
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button className="cx-numero" onClick={() => setListe(!liste)} aria-expanded={liste}>
              Grille {numero + 1} <span>/ {GRILLES.length}</span>
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              className="cx-icone"
              onClick={() => ouvrir(numero + 1)}
              disabled={numero === GRILLES.length - 1}
              aria-label="Grille suivante"
            >
              <ChevronRight size={18} aria-hidden />
            </button>

            {liste && (
              <div className="cx-liste" role="listbox" aria-label="Grilles">
                {GRILLES.map((_, n) => {
                  const p = parties[n]
                  const etat = gagnee(p) ? 'gagnee' : perdue(p) ? 'perdue' : p?.essais.length ? 'commencee' : ''
                  return (
                    <button
                      key={n}
                      role="option"
                      aria-selected={n === numero}
                      className={`cx-liste-${etat || 'neuve'}${n === numero ? ' cx-liste-actuelle' : ''}`}
                      onClick={() => ouvrir(n)}
                      title={etat === 'gagnee' ? 'Réussie' : etat === 'perdue' ? 'Ratée' : etat === 'commencee' ? 'En cours' : 'Pas encore jouée'}
                    >
                      {n + 1}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </header>

        <div className="cx-plateau">
          {bandeaux.map((g) => (
            <div key={g.titre} className={`cx-bandeau cx-niveau-${g.niveau}`}>
              <strong>{g.titre}</strong>
              <span>{g.mots.join(', ')}</span>
            </div>
          ))}
          {!perdue(partie) && (
            <div className="cx-tuiles" onAnimationEnd={() => setSecoue(false)}>
              {ordre.map((mot) => {
                const i = selection.indexOf(mot)
                const choisie = i >= 0
                return (
                  <button
                    key={mot}
                    className={`cx-tuile${choisie ? ' cx-choisie' : ''}${choisie && saut ? ' cx-saut' : ''}${choisie && secoue ? ' cx-secoue' : ''}`}
                    style={{ '--longueur': mot.length, animationDelay: choisie && saut ? `${i * 80}ms` : undefined } as React.CSSProperties}
                    onClick={() => choisir(mot)}
                    aria-pressed={choisie}
                  >
                    {mot}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {fini ? (
          <div className="cx-fin">
            <p>
              {gagnee(partie) ? (
                <>
                  <Check size={18} aria-hidden /> Grille réussie avec {partie.erreurs} erreur{partie.erreurs > 1 ? 's' : ''}
                </>
              ) : (
                'Grille ratée, voici les groupes.'
              )}
            </p>
            {suivante !== undefined && (
              <button className="cx-bouton cx-principal" onClick={() => ouvrir(suivante)}>
                Grille suivante <ArrowRight size={16} aria-hidden />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="cx-erreurs">
              Erreurs restantes :
              <span aria-label={`${ERREURS_MAX - partie.erreurs} sur ${ERREURS_MAX}`}>
                {Array.from({ length: ERREURS_MAX }, (_, i) => (
                  <i key={i} className={i < ERREURS_MAX - partie.erreurs ? 'cx-point' : 'cx-point cx-point-perdu'} />
                ))}
              </span>
            </div>
            <div className="cx-actions">
              <button className="cx-bouton" onClick={() => setOrdre(melanger(ordre))} disabled={saut}>
                Mélanger
              </button>
              <button className="cx-bouton" onClick={() => setSelection([])} disabled={!selection.length || saut}>
                Tout désélectionner
              </button>
              <button className="cx-bouton cx-principal" onClick={valider} disabled={selection.length !== 4 || saut}>
                Valider
              </button>
            </div>
          </>
        )}

        {message && (
          <div className="cx-message" role="status">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
