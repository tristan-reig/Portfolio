export type Rubrique = 'apropos' | 'projets' | 'contact'

export type Page = {
  rubrique: Rubrique | null
  volet?: string
  projet?: string
}

export type PropsRubrique = {
  page: Page
  naviguer: (page: Page) => void
  aller: (rubrique: Rubrique | null) => void
}

export const memePage = (a: Page, b: Page) => a.rubrique === b.rubrique && a.volet === b.volet && a.projet === b.projet
