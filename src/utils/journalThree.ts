import { setConsoleFunction } from 'three'

// Messages de three.js à ne pas afficher dans la console.
const MESSAGES_MASQUES = [
  'THREE.Clock: This module has been deprecated',
]

setConsoleFunction((type, message, ...params) => {
  if (MESSAGES_MASQUES.some((masque) => message.startsWith(masque))) return
  console[type](message, ...params)
})
