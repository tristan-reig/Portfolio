import type { AppliId } from './applis'

export const EVENEMENT_LANCER = 'os:lancer'

export const lancerAppli = (appli: AppliId) => window.dispatchEvent(new CustomEvent(EVENEMENT_LANCER, { detail: appli }))
