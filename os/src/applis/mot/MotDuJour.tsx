import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  chargerDictionnaire, ecrirePartie, enregistrerFin, ESSAIS, evaluer, jourDuJour, lirePartie, lireStats,
  LONGUEUR, motDuJour, normaliser, resultatAPartager, type Couleur, type Langue, type Stats,
} from './jeu'
import './MotDuJour.css'

const TEXTES = {
  fr: {
    titre: 'Mot du jour',
    court: 'Pas assez de lettres',
    inconnu: 'Mot inconnu',
    chargement: 'Chargement du dictionnaire…',
    bravo: ['Génial !', 'Magnifique !', 'Impressionnant !', 'Bravo !', 'Bien joué !', 'Ouf !'],
    perdu: 'Le mot était',
    jouees: 'Parties',
    victoires: '% victoires',
    serie: 'Série',
    meilleure: 'Record',
    repartition: 'Répartition des essais',
    copier: 'Copier le résultat',
    copie: 'Résultat copié !',
    copieImpossible: 'Copie impossible',
    prochain: 'Prochain mot dans',
    stats: 'Statistiques',
    fermer: 'Fermer',
    entree: 'Entrée',
    effacer: 'Effacer',
  },
  en: {
    titre: 'Daily word',
    court: 'Not enough letters',
    inconnu: 'Not in word list',
    chargement: 'Loading word list…',
    bravo: ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'],
    perdu: 'The word was',
    jouees: 'Played',
    victoires: 'Win %',
    serie: 'Streak',
    meilleure: 'Best',
    repartition: 'Guess distribution',
    copier: 'Copy result',
    copie: 'Copied!',
    copieImpossible: 'Could not copy',
    prochain: 'Next word in',
    stats: 'Statistics',
    fermer: 'Close',
    entree: 'Enter',
    effacer: 'Delete',
  },
}

const CLAVIERS = {
  fr: ['AZERTYUIOP', 'QSDFGHJKLM', '↵WXCVBN⌫'],
  en: ['QWERTYUIOP', 'ASDFGHJKL', '↵ZXCVBNM⌫'],
}

const PRIORITE: Record<Couleur, number> = { absent: 1, present: 2, bien: 3 }
const DUREE_RETOURNEMENT = 300

function lireLangue(): Langue {
  try {
    return localStorage.getItem('mot-langue') === 'en' ? 'en' : 'fr'
  } catch {
    return 'fr'
  }
}

export default function MotDuJour() {
  const [langue, setLangue] = useState<Langue>(lireLangue)
  const [jour, setJour] = useState(jourDuJour)
  const [essais, setEssais] = useState(() => lirePartie(langue, jour).essais)
  const [saisie, setSaisie] = useState('')
  const [dico, setDico] = useState<{ langue: Langue; mots: Set<string> } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [secoue, setSecoue] = useState(false)
  const [revelee, setRevelee] = useState<number | null>(null)
  const [panneau, setPanneau] = useState(false)
  const [stats, setStats] = useState<Stats>(() => lireStats(langue))
  const cadre = useRef<HTMLDivElement>(null)

  const t = TEXTES[langue]
  const solution = motDuJour(langue, jour)
  const gagne = essais.at(-1) === solution
  const fini = gagne || essais.length >= ESSAIS

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
    } catch {}
    setLangue(l)
    setEssais(lirePartie(l, jour).essais)
    setStats(lireStats(l))
    setSaisie('')
    setRevelee(null)
    setPanneau(false)
  }

  const valider = useCallback(() => {
    if (fini) return
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

    const victoire = saisie === solution
    if (victoire || suivants.length >= ESSAIS) {
      setStats(enregistrerFin(langue, jour, victoire, suivants.length))
      const apresRetournement = DUREE_RETOURNEMENT * LONGUEUR + 200
      window.setTimeout(() => {
        afficher(victoire ? t.bravo[suivants.length - 1] : `${t.perdu} ${solution}`, victoire ? 1800 : 3500)
      }, apresRetournement)
      window.setTimeout(() => setPanneau(true), apresRetournement + 1400)
    }
  }, [fini, dico, langue, saisie, essais, jour, solution, t, afficher])

  const taper = useCallback(
    (touche: string) => {
      if (fini) return
      if (touche === '↵') valider()
      else if (touche === '⌫') setSaisie((s) => s.slice(0, -1))
      else setSaisie((s) => (s.length < LONGUEUR ? s + touche : s))
    },
    [fini, valider],
  )

  // Clavier physique
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (!cadre.current?.closest('.fenetre-active')) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (panneau) {
        if (e.key === 'Escape' || e.key === 'Enter') setPanneau(false)
        else return
      } else if (e.key === 'Enter') taper('↵')
      else if (e.key === 'Backspace') taper('⌫')
      else if (/^\p{L}$/u.test(e.key) && /^[A-Z]$/.test(normaliser(e.key))) taper(normaliser(e.key))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [taper, panneau])

  useEffect(() => {
    const minuteur = window.setInterval(() => {
      const j = jourDuJour()
      if (j === jour) return
      setJour(j)
      setEssais(lirePartie(langue, j).essais)
      setRevelee(null)
      setPanneau(false)
    }, 1000)
    return () => clearInterval(minuteur)
  }, [jour, langue])

  const touches = useMemo(() => {
    const c = new Map<string, Couleur>()
    essais.forEach((e) =>
      evaluer(e, solution).forEach((couleur, i) => {
        const avant = c.get(e[i])
        if (!avant || PRIORITE[couleur] > PRIORITE[avant]) c.set(e[i], couleur)
      }),
    )
    return c
  }, [essais, solution])

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(resultatAPartager(langue, jour, essais, solution, gagne))
      afficher(t.copie)
    } catch {
      afficher(t.copieImpossible)
    }
  }

  const maxRepartition = Math.max(1, ...stats.repartition)

  return (
    <div className="mot-cadre" ref={cadre}>
      <div className="mot">
        <header className="mot-entete">
          <h1>
            {t.titre} <span className="mot-numero">n°{jour + 1}</span>
          </h1>
          <div className="mot-actions">
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
            <button className="mot-icone" onClick={() => setPanneau(true)} title={t.stats} aria-label={t.stats}>
              <IconeStats />
            </button>
          </div>
        </header>

        <div className="mot-grille" role="grid" aria-label={t.titre}>
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
                    onPointerDown={(e) => e.preventDefault()}
                    aria-label={touche === '↵' ? t.entree : touche === '⌫' ? t.effacer : touche}
                  >
                    {touche === '↵' ? t.entree : touche === '⌫' ? <IconeEffacer /> : touche}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {message && <div className="mot-message" role="status">{message}</div>}

        {panneau && (
          <div className="mot-voile" onClick={() => setPanneau(false)}>
            <div className="mot-panneau" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.stats}>
              <button className="mot-icone mot-fermer" onClick={() => setPanneau(false)} aria-label={t.fermer}>×</button>
              <h2>{t.stats}</h2>
              <div className="mot-chiffres">
                <Chiffre valeur={stats.jouees} texte={t.jouees} />
                <Chiffre valeur={stats.jouees ? Math.round((stats.gagnees / stats.jouees) * 100) : 0} texte={t.victoires} />
                <Chiffre valeur={stats.serie} texte={t.serie} />
                <Chiffre valeur={stats.meilleure} texte={t.meilleure} />
              </div>
              <h3>{t.repartition}</h3>
              <div className="mot-repartition">
                {stats.repartition.map((n, i) => (
                  <div key={i} className="mot-barre-ligne">
                    <span>{i + 1}</span>
                    <div
                      className={`mot-barre${fini && gagne && essais.length === i + 1 ? ' mot-barre-actuelle' : ''}`}
                      style={{ width: `${Math.max(8, (n / maxRepartition) * 100)}%` }}
                    >
                      {n}
                    </div>
                  </div>
                ))}
              </div>
              {fini && (
                <div className="mot-fin">
                  <Compte texte={t.prochain} />
                  <button className="mot-copier" onClick={copier}>{t.copier}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Chiffre({ valeur, texte }: { valeur: number; texte: string }) {
  return (
    <div className="mot-chiffre">
      <strong>{valeur}</strong>
      <span>{texte}</span>
    </div>
  )
}

// Compte à rebours jusqu'à minuit
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

function IconeStats() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 20V12M12 20V5M19 20v-9" />
    </svg>
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
