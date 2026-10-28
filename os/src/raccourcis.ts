import { basculerLecture } from './applis/musique/etat'

// Raccourcis clavier de l'OS

const zoneDeTexte = (cible: EventTarget | null) =>
  cible instanceof HTMLElement && (cible.isContentEditable || /^(input|textarea|select)$/i.test(cible.tagName)) &&
  !(cible instanceof HTMLInputElement && cible.type === 'range')

window.addEventListener(
  'keydown',
  (e) => {
    if (e.key !== ' ' || e.repeat || zoneDeTexte(e.target)) return
    if (basculerLecture()) e.preventDefault()
  },
  true,
)

window.addEventListener('message', (e) => {
  if (e.source !== window.parent || e.data?.type !== 'touche') return
  if (e.data.key === ' ') basculerLecture()
  else window.dispatchEvent(new KeyboardEvent('keydown', { key: e.data.key, ctrlKey: !!e.data.ctrl, shiftKey: !!e.data.maj, cancelable: true }))
})
