const LARGEUR_REFERENCE = 1280

function ajuster() {
  if (window.parent === window) return
  document.documentElement.style.zoom = String(window.innerWidth / LARGEUR_REFERENCE)
}

ajuster()
window.addEventListener('resize', ajuster)

export const echelle = () => Number(document.documentElement.style.zoom) || 1
