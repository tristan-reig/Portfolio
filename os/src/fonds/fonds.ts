// Fonds d'écran proposés dans le sélecteur.

export const COULEURS = {
  rouge: '#ff5a36',
  orange: '#ffa31a',
  jaune: '#ffd60a',
  vert: '#34c759',
  bleu: '#2e9bff',
  violet: '#9b51e0',
  rose: '#ff6fb5',
  gris: '#a6a6ad',
} as const

export type Couleur = keyof typeof COULEURS

export type Fond = {
  id: string
  nom: string
  couleur: Couleur
  fond: string
}

export const FONDS: Fond[] = [
  { id: 'altai', nom: 'Altai', couleur: 'bleu', fond: 'center / cover url(/os/fonds/Altai.webp)' },
  { id: 'ashimdsilva', nom: 'AshimDSilva', couleur: 'orange', fond: 'center / cover url(/os/fonds/AshimDSilva.jpg)' },
  { id: 'Bloom', nom: 'bloom', couleur: 'vert', fond: 'center / cover url(/os/fonds/Bloom.jpg)' },
  { id: 'cluster', nom: 'Cluster', couleur: 'rouge', fond: 'center / cover url(/os/fonds/Cluster.webp)' },
  { id: 'elarun', nom: 'Elarun', couleur: 'bleu', fond: 'center / cover url(/os/fonds/Elarun.webp)' },
  { id: 'icecold', nom: 'IceCold', couleur: 'bleu', fond: 'center / cover url(/os/fonds/IceCold.webp)' },
  { id: 'kay', nom: 'Kay', couleur: 'bleu', fond: 'center / cover url(/os/fonds/Kay.webp)' },
  { id: 'milkyway', nom: 'MilkyWay', couleur: 'violet', fond: 'center / cover url(/os/fonds/MilkyWay.webp)' },
  { id: 'mountain', nom: 'Mountai,', couleur: 'gris', fond: 'center / cover url(/os/fonds/Mountain.webp)' },
  { id: 'mrlee', nom: 'MrLee', couleur: 'gris', fond: 'center / cover url(/os/fonds/MrLee.jpg)' },
  { id: 'nuvole', nom: 'Nuvole', couleur: 'rose', fond: 'center / cover url(/os/fonds/Nuvole.webp)' },
  { id: 'orionnebula', nom: 'OrionNebula', couleur: 'rose', fond: 'center / cover url(/os/fonds/OrionNebula.jpg)' },
  { id: 'plain', nom: 'Plain', couleur: 'vert', fond: 'center / cover url(/os/fonds/Plain.jpg)' },
  { id: 'planet', nom: 'Planet', couleur: 'orange', fond: 'center / cover url(/os/fonds/Planet.jpg)' },
  { id: 'safelanding', nom: 'SafeLanding', couleur: 'jaune', fond: 'center / cover url(/os/fonds/SafeLanding.webp)' },
  { id: 'scarlettree', nom: 'ScarletTree', couleur: 'orange', fond: 'center / cover url(/os/fonds/ScarletTree.webp)' },
  { id: 'snowcappedmountain', nom: 'SnowCappedMountain', couleur: 'gris', fond: 'center / cover url(/os/fonds/SnowCappedMountain.jpg)' },
  { id: 'stellar', nom: 'Stellar', couleur: 'gris', fond: 'center / cover url(/os/fonds/Stellar.jpg)' },
  { id: 'tarantulanebula', nom: 'TarantulaNebula', couleur: 'orange', fond: 'center / cover url(/os/fonds/TarantulaNebula.jpg)' },
  { id: 'weeb', nom: 'Weeb', couleur: 'bleu', fond: 'center / cover url(/os/fonds/Weeb.jpg)' },
]

export const FOND_PAR_DEFAUT = FONDS[0]

