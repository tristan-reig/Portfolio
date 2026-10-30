import type { ComponentType } from 'react'
import { Briefcase, LayoutGrid, Music, type LucideIcon } from 'lucide-react'
import MotDuJour from './mot/MotDuJour'
import Musique from './musique/Musique'
import Portfolio from './portfolio/Portfolio'

export type Appli = {
  titre: string
  // Une ligne, affichée dans le lanceur
  description: string
  // Fond de l'icône dans le lanceur (couleur pastel, l'icône est dessinée en sombre dessus)
  couleur: string
  // Icône Lucide (https://lucide.dev/icons)
  Icone: LucideIcon
  Contenu: ComponentType
}

export const APPLIS = {
  portfolio: { titre: 'Portfolio', description: 'Qui je suis, mes projets et comment me contacter', couleur: '#cba6f7', Icone: Briefcase, Contenu: Portfolio },
  musique: { titre: 'Musique', description: 'Ma playlist du moment, avec les paroles', couleur: '#f5c2e7', Icone: Music, Contenu: Musique },
  mot: { titre: 'Wordle', description: 'Le mot du jour en 6 essais, en français ou en anglais', couleur: '#a6e3a1', Icone: LayoutGrid, Contenu: MotDuJour },
} satisfies Record<string, Appli>

export type AppliId = keyof typeof APPLIS

// Fenêtres ouvertes au démarrage
export const AU_DEMARRAGE: AppliId[] = ['portfolio']

// Titre et contenu d'une appli. Passer par cette fonction plutôt que par APPLIS[id]
// garde le code valide même quand la liste est vide.
export const infosAppli = (id: AppliId): Appli => (APPLIS as Record<string, Appli>)[id]

// Toutes les applis, dans l'ordre de la liste
export const toutesLesApplis = () => Object.entries(APPLIS as Record<string, Appli>) as [AppliId, Appli][]
