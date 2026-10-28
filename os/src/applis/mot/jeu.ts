import { SOLUTIONS } from './solutions'

export type Langue = 'fr' | 'en'
export type Couleur = 'bien' | 'present' | 'absent'

export const LONGUEUR = 5
export const ESSAIS = 6

const DEBUT = Date.UTC(2026, 0, 1)
export function jourDuJour(date = new Date()) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - DEBUT) / 86_400_000)
}

function melanger<T>(liste: T[], graine: number) {
  const copie = [...liste]
  let a = graine
  const hasard = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

const ORDRE = { fr: melanger(SOLUTIONS.fr, 1729), en: melanger(SOLUTIONS.en, 4242) }

export function motDuJour(langue: Langue, jour: number) {
  const liste = ORDRE[langue]
  return liste[((jour % liste.length) + liste.length) % liste.length]
}

const dictionnaires: Partial<Record<Langue, Promise<Set<string>>>> = {}
export function chargerDictionnaire(langue: Langue) {
  dictionnaires[langue] ??= (langue === 'fr' ? import('./mots-fr.json') : import('./mots-en.json')).then(
    (m) => new Set([...(m.default as string[]), ...SOLUTIONS[langue]]),
  )
  return dictionnaires[langue]
}

export const normaliser = (lettre: string) =>
  lettre.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()

export function evaluer(essai: string, solution: string): Couleur[] {
  const resultat: Couleur[] = Array(LONGUEUR).fill('absent')
  const restantes = new Map<string, number>()
  for (let i = 0; i < LONGUEUR; i++) {
    if (essai[i] === solution[i]) resultat[i] = 'bien'
    else restantes.set(solution[i], (restantes.get(solution[i]) ?? 0) + 1)
  }
  for (let i = 0; i < LONGUEUR; i++) {
    const n = restantes.get(essai[i]) ?? 0
    if (resultat[i] !== 'bien' && n > 0) {
      resultat[i] = 'present'
      restantes.set(essai[i], n - 1)
    }
  }
  return resultat
}

export type Partie = { jour: number; essais: string[] }
export type Stats = { jouees: number; gagnees: number; serie: number; meilleure: number; dernierJourGagne: number; repartition: number[] }

const STATS_VIDES: Stats = { jouees: 0, gagnees: 0, serie: 0, meilleure: 0, dernierJourGagne: -2, repartition: Array(ESSAIS).fill(0) }

function lire<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle)
    return brut ? { ...defaut, ...JSON.parse(brut) } : defaut
  } catch {
    return defaut
  }
}

function ecrire(cle: string, valeur: unknown) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {}
}

export function lirePartie(langue: Langue, jour: number): Partie {
  const p = lire<Partie>(`mot-partie-${langue}`, { jour, essais: [] })
  return p.jour === jour ? p : { jour, essais: [] }
}

export const ecrirePartie = (langue: Langue, partie: Partie) => ecrire(`mot-partie-${langue}`, partie)

export const lireStats = (langue: Langue) => lire<Stats>(`mot-stats-${langue}`, STATS_VIDES)

// Fin de partie : on met les statistiques à jour
export function enregistrerFin(langue: Langue, jour: number, gagne: boolean, essais: number): Stats {
  const s = lireStats(langue)
  const nouvelles: Stats = {
    ...s,
    jouees: s.jouees + 1,
    gagnees: s.gagnees + (gagne ? 1 : 0),
    serie: gagne ? (s.dernierJourGagne === jour - 1 ? s.serie + 1 : 1) : 0,
    dernierJourGagne: gagne ? jour : s.dernierJourGagne,
    repartition: s.repartition.map((n, i) => (gagne && i === essais - 1 ? n + 1 : n)),
  }
  nouvelles.meilleure = Math.max(s.meilleure, nouvelles.serie)
  ecrire(`mot-stats-${langue}`, nouvelles)
  return nouvelles
}

// Résultat à partager, avec des carrés de couleur (sans dévoiler le mot)
export function resultatAPartager(langue: Langue, jour: number, essais: string[], solution: string, gagne: boolean) {
  const carres: Record<Couleur, string> = { bien: '🟩', present: '🟨', absent: '⬛' }
  const titre = langue === 'fr' ? 'Mot du jour' : 'Daily word'
  const lignes = essais.map((e) => evaluer(e, solution).map((c) => carres[c]).join(''))
  return `${titre} n°${jour + 1} ${gagne ? essais.length : 'X'}/${ESSAIS}\n\n${lignes.join('\n')}`
}
