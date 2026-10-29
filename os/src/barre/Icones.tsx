// Icônes de la barre, dessinées à la main (16 px, couleur du texte)
const props = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function IconeReseau() {
  return (
    <svg {...props}>
      <path d="M2 9a15 15 0 0 1 20 0" />
      <path d="M5.5 12.5a10 10 0 0 1 13 0" />
      <path d="M9 16a5 5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function IconeVolume() {
  return (
    <svg {...props}>
      <path d="M4 9v6h4l5 4V5L8 9z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  )
}

export function IconeAlimentation() {
  return (
    <svg {...props}>
      <path d="M12 3v8" />
      <path d="M6.3 7a8 8 0 1 0 11.4 0" />
    </svg>
  )
}

export function IconeBatterie({ niveau }: { niveau: number }) {
  return (
    <svg {...props} width={22} viewBox="0 0 28 24">
      <rect x="2" y="7" width="20" height="10" rx="2.5" />
      <path d="M25 10.5v3" />
      <rect x="4.5" y="9.5" width={15 * niveau} height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconeEclair() {
  return (
    <svg {...props} width={12} height={12} fill="currentColor" strokeWidth={1}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  )
}

export function IconeFond() {
  return (
    <svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="m3.5 17 5-5 4 4 2.5-2.5 5.5 5.5" />
    </svg>
  )
}
