import type { ComponentType } from 'react'
import { Box, Code, Gamepad2, type LucideIcon } from 'lucide-react'
import DoomLike from './DoomLike'
import PeaceBreak from './PeaceBreak'
import type { TechnoId } from './technos'

export type VoletId = 'jeux' | 'programmation' | '3d'

export type Volet = { id: VoletId; titre: string; sousTitre: string; Icone: LucideIcon }

export type Projet = {
  id: string
  volet: VoletId
  titre: string
  langage: string
  cadre: 'Perso' | '42' | 'Université'
  annee?: string
  accroche?: string
  technos?: TechnoId[]
  // Images de la carte
  vignette?: { images: string[]; telephone?: boolean }
  // Page de détail du projet
  Page?: ComponentType
}

export const VOLETS: Volet[] = [
  { id: 'jeux', titre: 'Jeux', sousTitre: 'vidéo', Icone: Gamepad2 },
  { id: 'programmation', titre: 'Programmation', sousTitre: 'Logiciel et système', Icone: Code },
  { id: '3d', titre: '3D', sousTitre: '& animation', Icone: Box },
]

export const PROJETS: Projet[] = [
  {
    id: 'peace-break',
    volet: 'jeux',
    titre: 'Peace Break',
    langage: 'Dart',
    cadre: '42',
    annee: '2026',
    accroche: 'Un casse-briques arcade pour Android, publié sur F-Droid.',
    technos: ['dart', 'flutter', 'supabase'],
    vignette: { images: ['projets/peace-break/menu.webp', 'projets/peace-break/jeu.webp', 'projets/peace-break/boutique.webp'], telephone: true },
    Page: PeaceBreak,
  },
  {
    id: 'doom-like',
    volet: 'jeux',
    titre: 'Doom-like',
    langage: 'Lua',
    cadre: 'Perso',
    annee: '2026',
    accroche: 'Un jeu de tir à la Doom, codé de zéro en Lua.',
    technos: ['lua', 'love', 'glsl'],
    vignette: { images: ['projets/doom-like/jeu.png'] },
    Page: DoomLike,
  },
  { id: 'platformer', volet: 'jeux', titre: 'Platformer', langage: 'C#', cadre: 'Perso' },
  { id: 'ft_minecraft', volet: 'jeux', titre: 'ft_minecraft', langage: 'Java', cadre: '42' },
  { id: 'ft_transcendence', volet: 'programmation', titre: 'ft_transcendence', langage: 'JavaScript', cadre: '42' },
  { id: 'simesengine', volet: 'programmation', titre: 'Simesengine', langage: 'Python', cadre: 'Université' },
  { id: 'minishell', volet: 'programmation', titre: 'minishell', langage: 'C', cadre: '42' },
]
