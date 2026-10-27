// Quand l'OS est affiché dans l'écran de la scène 3D, il transmet à la page parente
const TOUCHES = ['Escape']

if (window.parent !== window) {
  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) return
    if (TOUCHES.includes(e.key)) window.parent.postMessage({ type: 'touche', key: e.key }, '*')
  })
}
