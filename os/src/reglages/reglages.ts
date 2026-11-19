import { useSyncExternalStore } from 'react'
import type { AppliId } from '../applis/applis'
import { FOND_PAR_DEFAUT, FONDS, type Fond } from '../fonds/fonds'

// Réglages de l'OS, partagés entre le bureau et l'appli Paramètres

export const ACCENTS = {
  hyprland: { nom: 'Hyprland', accent: '#89b4fa', bordure: ['#33ccff', '#00ff99'] },
  mauve: { nom: 'Mauve', accent: '#cba6f7', bordure: ['#cba6f7', '#f5c2e7'] },
  vert: { nom: 'Vert', accent: '#a6e3a1', bordure: ['#a6e3a1', '#94e2d5'] },
  peche: { nom: 'Pêche', accent: '#fab387', bordure: ['#fab387', '#f9e2af'] },
  rose: { nom: 'Rose', accent: '#f5c2e7', bordure: ['#f38ba8', '#f5c2e7'] },
  ciel: { nom: 'Ciel', accent: '#89dceb', bordure: ['#74c7ec', '#b4befe'] },
} as const

export type AccentId = keyof typeof ACCENTS

export type Reglages = {
  fond: string // identifiant du fond d'écran
  accent: AccentId
  espace: number // marge entre les fenêtres
  arrondi: number // arrondi des coins des fenêtres
  animationsReduites: boolean
  volume: number // volume de la musique
  sonsScene: boolean
  demarrage: AppliId[] // applis ouvertes au démarrage
  verrouAuto: number
}

const CLE = 'os-reglages'

const mouvementReduit = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export const PAR_DEFAUT: Reglages = {
  fond: FOND_PAR_DEFAUT.id,
  accent: 'hyprland',
  espace: 8,
  arrondi: 10,
  animationsReduites: mouvementReduit(),
  volume: 80,
  sonsScene: true,
  demarrage: ['portfolio'],
  verrouAuto: 0,
}

function lire(): Reglages {
  try {
    const r = { ...PAR_DEFAUT, ...JSON.parse(localStorage.getItem(CLE) ?? '{}') }
    const ancienFond = localStorage.getItem('os-fond')
    if (ancienFond && !localStorage.getItem(CLE)) r.fond = ancienFond
    if (!(r.accent in ACCENTS)) r.accent = PAR_DEFAUT.accent
    return r
  } catch {
    return PAR_DEFAUT
  }
}

let reglages = lire()
const abonnes = new Set<() => void>()

function appliquer(r: Reglages) {
  const s = document.documentElement.style
  const a = ACCENTS[r.accent]
  s.setProperty('--accent', a.accent)
  s.setProperty('--bordure-active-1', a.bordure[0])
  s.setProperty('--bordure-active-2', a.bordure[1])
  s.setProperty('--espace', `${r.espace}px`)
  s.setProperty('--arrondi', `${r.arrondi}px`)
  document.documentElement.classList.toggle('animations-reduites', r.animationsReduites)
  if (window.parent !== window) window.parent.postMessage({ type: 'sons', actifs: r.sonsScene }, '*')
}
appliquer(reglages)

export function modifier(changements: Partial<Reglages>) {
  reglages = { ...reglages, ...changements }
  appliquer(reglages)
  abonnes.forEach((f) => f())
  try {
    localStorage.setItem(CLE, JSON.stringify(reglages))
  } catch {
    // Stockage indisponible
  }
}

export const lireReglages = () => reglages

// Remet tous les réglages par défaut
export const reinitialiserReglages = () => modifier(PAR_DEFAUT)

export function useReglages() {
  return useSyncExternalStore(
    (f) => {
      abonnes.add(f)
      return () => abonnes.delete(f)
    },
    () => reglages,
  )
}

// Fond d'écran choisi
export const fondActuel = (r: Reglages): Fond => FONDS.find((f) => f.id === r.fond) ?? FOND_PAR_DEFAUT
