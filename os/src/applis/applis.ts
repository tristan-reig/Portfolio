import type { ComponentType } from 'react'
import { IconeMot, IconeMusique } from './icones'
import MotDuJour from './mot/MotDuJour'
import Musique from './musique/Musique'

export type Appli = {
  titre: string
  description: string
  couleur: string
  Icone: ComponentType
  Contenu: ComponentType
}

export const APPLIS = {
  musique: { titre: 'Musique', description: 'Ma playlist du moment, avec les paroles', couleur: '#f5c2e7', Icone: IconeMusique, Contenu: Musique },
  mot: { titre: 'Wordle', description: 'Le mot du jour en 6 essais, en français ou en anglais', couleur: '#a6e3a1', Icone: IconeMot, Contenu: MotDuJour },
} satisfies Record<string, Appli>

export type AppliId = keyof typeof APPLIS

// Fenêtres ouvertes au démarrage
export const AU_DEMARRAGE: AppliId[] = []

export const infosAppli = (id: AppliId): Appli => (APPLIS as Record<string, Appli>)[id]

export const toutesLesApplis = () => Object.entries(APPLIS as Record<string, Appli>) as [AppliId, Appli][]
