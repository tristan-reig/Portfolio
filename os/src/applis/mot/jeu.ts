import { SOLUTIONS } from './solutions'

export type Langue = 'fr' | 'en'
export type Couleur = 'bien' | 'present' | 'absent'

export const LONGUEUR = 5
export const ESSAIS = 6

// Numéro du jour (même mot pour tout le monde à une date donnée), compté depuis le 1er janvier 2026
const DEBUT = Date.UTC(2026, 0, 1)
export function jourDuJour(date = new Date()) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - DEBUT) / 86_400_000)
}

// Mélange fixe de la liste (toujours le même), pour que les mots ne sortent pas dans l'ordre alphabétique
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

// Mots acceptés, chargés à la demande (≈ 50 et 100 ko)
const dictionnaires: Partial<Record<Langue, Promise<Set<string>>>> = {}
export function chargerDictionnaire(langue: Langue) {
  dictionnaires[langue] ??= (langue === 'fr' ? import('./mots-fr.json') : import('./mots-en.json')).then(
    (m) => new Set([...(m.default as string[]), ...SOLUTIONS[langue]]),
  )
  return dictionnaires[langue]
}

// « é » → « E » : les accents sont ignorés
export const normaliser = (lettre: string) =>
  lettre.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()

// Couleur de chaque lettre, en gérant les lettres en double comme le jeu original :
// d'abord les lettres bien placées, puis les présentes, dans la limite de leur nombre dans le mot
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

// ——— Sauvegarde (dans le navigateur du visiteur) ———

export type Partie = { jour: number; essais: string[] }


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
  } catch {
    // Stockage indisponible (navigation privée…) : la partie vaut pour cette visite seulement
  }
}

export function lirePartie(langue: Langue, jour: number): Partie {
  const p = lire<Partie>(`mot-partie-${langue}`, { jour, essais: [] })
  return p.jour === jour ? p : { jour, essais: [] }
}

export const ecrirePartie = (langue: Langue, partie: Partie) => ecrire(`mot-partie-${langue}`, partie)
