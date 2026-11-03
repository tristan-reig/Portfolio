import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, X } from 'lucide-react'
import { echelle } from '../../zoom'
import { GRILLES, type Groupe } from './grilles'
import './Connexions.css'

const ERREURS_MAX = 4
const DUREE_SAUT = 450
const DUREE_RANGEMENT = 550
const COULEURS = ['jaune', 'vert', 'bleu', 'violet']

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

const motsRestants = (grille: number, partie: Partie) =>
  melanger(GRILLES[grille].flatMap((g, i) => (partie.trouves.includes(i) ? [] : g.mots)))

const BRAVO = ['Parfait !', 'Superbe !', 'Bien joué !', 'Ouf !']

function versLaPremiereLigne(ordre: string[], trouves: string[]) {
  const suite = [...ordre]
  const aDeplacer = trouves.filter((m) => suite.indexOf(m) >= 4)
  const libres = [0, 1, 2, 3].filter((i) => !trouves.includes(suite[i]))
  aDeplacer.forEach((mot, k) => {
    const de = suite.indexOf(mot)
    const vers = libres[k]
    ;[suite[de], suite[vers]] = [suite[vers], suite[de]]
  })
  return suite
}

const sansAccents = (texte: string) => [...texte].map((c) => c.normalize('NFD').replace(/\p{M}/gu, '')).join('')

function MotExplique({ mot, cache, note }: { mot: string; cache?: string; note?: string }) {
  const i = cache ? sansAccents(mot).indexOf(sansAccents(cache)) : -1
  const lettres = [...mot]
  return (
    <span className="cx-mot">
      {i >= 0 && cache ? (
        <>
          {lettres.slice(0, i).join('')}
          <mark>{lettres.slice(i, i + [...cache].length).join('')}</mark>
          {lettres.slice(i + [...cache].length).join('')}
        </>
      ) : (
        mot
      )}
      {note && <small> ({note})</small>}
    </span>
  )
}

function lireAideVue() {
  try {
    return localStorage.getItem('connexions-aide') === 'vue'
  } catch {
    return true
  }
}

export default function Connexions() {
  const [parties, setParties] = useState(lireParties)
  // On reprend à la première grille pas encore terminée
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
  const [aide, setAide] = useState(() => !lireAideVue())
  const [rangement, setRangement] = useState<number | null>(null)
  const tuiles = useRef(new Map<string, HTMLButtonElement>())
  const positions = useRef<Map<string, DOMRect> | null>(null)
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

  const deplacer = (nouvelOrdre: string[]) => {
    positions.current = new Map([...tuiles.current].map(([mot, el]) => [mot, el.getBoundingClientRect()]))
    setOrdre(nouvelOrdre)
  }
  useLayoutEffect(() => {
    const avant = positions.current
    if (!avant) return
    positions.current = null
    const k = echelle()
    tuiles.current.forEach((el, mot) => {
      const a = avant.get(mot)
      if (!a) return
      const b = el.getBoundingClientRect()
      const dx = (a.left - b.left) / k
      const dy = (a.top - b.top) / k
      if (dx || dy)
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
          duration: 380,
          easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
        })
    })
  }, [ordre])

  const fermerAide = () => {
    setAide(false)
    try {
      localStorage.setItem('connexions-aide', 'vue')
    } catch {}
  }

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
    setRangement(null)
    setMessage(null)
    setListe(false)
  }

  const choisir = (mot: string) => {
    if (fini || saut || rangement !== null) return
    setSelection((s) => (s.includes(mot) ? s.filter((m) => m !== mot) : s.length < 4 ? [...s, mot] : s))
  }

  const valider = () => {
    if (selection.length !== 4 || fini || saut || rangement !== null) return
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
        // Les quatre tuiles prennent la couleur du groupe et glissent sur la première ligne libre…
        setRangement(groupes[0])
        deplacer(versLaPremiereLigne(ordre, selection))
        plusTard(() => {
          const trouves = [...partie.trouves, groupes[0]]
          enregistrer({ ...partie, trouves, essais })
          setOrdre((o) => o.filter((m) => !selection.includes(m)))
          setSelection([])
          setRangement(null)
          if (trouves.length === 4) afficher(BRAVO[partie.erreurs], 2400)
        }, DUREE_RANGEMENT)
        return
      }

      const erreurs = partie.erreurs + 1
      enregistrer({ ...partie, erreurs, essais })
      setSecoue(true)
      if (erreurs >= ERREURS_MAX) {
        setSelection([])
        afficher('Dommage !', 2400)
      } else afficher(compte === 3 ? 'À un mot près !' : "Ce n'est pas un groupe")
    }, DUREE_SAUT)
  }

  // Prochaine grille pas encore terminée, après celle-ci
  const suivante = [...GRILLES.keys()].map((i) => (numero + 1 + i) % GRILLES.length).find((n) => !finie(parties[n]))

  return (
    <div className="cx-cadre">
      <div className="cx">
        <header className="cx-entete">
          <div className="cx-titre">
            <h1>Connections</h1>
            <button className="cx-icone" onClick={() => setAide(true)} title="Règles du jeu" aria-label="Règles du jeu">
              <CircleHelp size={16} aria-hidden />
            </button>
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
              <span>
                {g.mots.map((mot, i) => (
                  <span key={mot}>
                    {i > 0 && ', '}
                    <MotExplique mot={mot} cache={g.caches?.[i]} note={g.notes?.[i]} />
                  </span>
                ))}
              </span>
            </div>
          ))}
          {!perdue(partie) && (
            <div className="cx-tuiles" onAnimationEnd={() => setSecoue(false)}>
              {ordre.map((mot) => {
                const i = selection.indexOf(mot)
                const choisie = i >= 0
                const classes = ['cx-tuile']
                if (choisie) classes.push('cx-choisie')
                if (choisie && saut) classes.push('cx-saut')
                if (choisie && secoue) classes.push('cx-secoue')
                if (choisie && rangement !== null) classes.push('cx-rangee', `cx-niveau-${grille[rangement].niveau}`)
                return (
                  <button
                    key={mot}
                    ref={(el) => {
                      if (el) tuiles.current.set(mot, el)
                      else tuiles.current.delete(mot)
                    }}
                    className={classes.join(' ')}
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
              <button className="cx-bouton" onClick={() => deplacer(melanger(ordre))} disabled={saut || rangement !== null}>
                Mélanger
              </button>
              <button className="cx-bouton" onClick={() => setSelection([])} disabled={!selection.length || saut}>
                Tout désélectionner
              </button>
              <button className="cx-bouton cx-principal" onClick={valider} disabled={selection.length !== 4 || saut || rangement !== null}>
                Valider
              </button>
            </div>
          </>
        )}

        {aide && (
          <div className="cx-voile" onClick={fermerAide}>
            <div className="cx-aide" role="dialog" aria-label="Règles du jeu" onClick={(e) => e.stopPropagation()}>
              <button className="cx-icone cx-fermer" onClick={fermerAide} aria-label="Fermer">
                <X size={16} aria-hidden />
              </button>
              <h2>Comment jouer</h2>
              <p>Trouvez les quatre groupes de quatre mots qui ont un point commun.</p>
              <ul>
                <li>Sélectionnez quatre mots, puis validez.</li>
                <li>Quatre erreurs sont permises.</li>
                <li>Gare aux pièges : certains mots semblent aller dans plusieurs groupes.</li>
              </ul>
              <p className="cx-aide-niveaux">Chaque groupe a sa couleur, du plus simple au plus retors :</p>
              <div className="cx-aide-couleurs">
                {COULEURS.map((c, i) => (
                  <span key={c} className={`cx-niveau-${i}`}>
                    {c}
                  </span>
                ))}
              </div>
              <button className="cx-bouton cx-principal" onClick={fermerAide}>
                C'est parti
              </button>
            </div>
          </div>
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
