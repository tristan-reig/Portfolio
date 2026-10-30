// Rubriques du portfolio, et ce que reçoit le contenu de chacune
export type Rubrique = 'apropos' | 'projets' | 'contact'

export type PropsRubrique = {
  // Ouvre une autre rubrique (null : l'accueil)
  aller: (rubrique: Rubrique | null) => void
}
