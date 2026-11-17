import type { ComponentType } from 'react'
import { Box, Code, Gamepad2, type LucideIcon } from 'lucide-react'
import DoomLike from './DoomLike'

export type VoletId = 'jeux' | 'programmation' | '3d'

export type Volet = { id: VoletId; titre: string; sousTitre: string; Icone: LucideIcon }

export type Projet = {
  id: string
  volet: VoletId
  titre: string
  langage: string
  cadre: 'Perso' | '42' | 'Université'
  // Page de détail du projet ; sans page, le projet apparaît en « bientôt »
  Page?: ComponentType
}

export const VOLETS: Volet[] = [
  { id: 'jeux', titre: 'Jeux vidéo', sousTitre: 'Projets jouables', Icone: Gamepad2 },
  { id: 'programmation', titre: 'Programmation', sousTitre: 'Logiciel et système', Icone: Code },
  { id: '3d', titre: '3D', sousTitre: '& animation', Icone: Box },
]

export const PROJETS: Projet[] = [
  { id: 'pb', volet: 'jeux', titre: 'PB', langage: 'Dart', cadre: '42' },
  { id: 'doom-like', volet: 'jeux', titre: 'Doom-like', langage: 'Lua', cadre: 'Perso', Page: DoomLike },
  { id: 'platformer', volet: 'jeux', titre: 'Platformer', langage: 'C#', cadre: 'Perso' },
  { id: 'ft_minecraft', volet: 'jeux', titre: 'ft_minecraft', langage: 'Java', cadre: '42' },
  { id: 'ft_transcendence', volet: 'programmation', titre: 'ft_transcendence', langage: 'JavaScript', cadre: '42' },
  { id: 'simesengine', volet: 'programmation', titre: 'Simesengine', langage: 'Python', cadre: 'Université' },
  { id: 'minishell', volet: 'programmation', titre: 'minishell', langage: 'C', cadre: '42' },
]
