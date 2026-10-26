const TOUCHES = ['Escape']

if (window.parent !== window) {
  window.addEventListener('keydown', (e) => {
    if (TOUCHES.includes(e.key)) window.parent.postMessage({ type: 'touche', key: e.key }, '*')
  })
}
