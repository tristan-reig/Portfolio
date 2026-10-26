import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { useProgressionModele } from '../three/modele'

// L'écran de chargement est écrit directement dans index.html, pour s'afficher avant le JavaScript.
export default function Chargement() {
  const { part, termine } = useProgressionModele()
  const { progress, active } = useProgress()
  const pret = termine && !active && progress === 100

  useEffect(() => {
    const zone = document.getElementById('chargement-pourcent')
    if (zone) zone.textContent = part === null ? '' : ` ${Math.round(part * 100)} %`
  }, [part])

  useEffect(() => {
    if (!pret) return
    const ecran = document.getElementById('chargement')
    if (!ecran) return

    ecran.classList.add('fini')
    const retirer = () => ecran.remove()
    ecran.addEventListener('transitionend', retirer, { once: true })
    const secours = setTimeout(retirer, 1000)
    return () => clearTimeout(secours)
  }, [pret])

  return null
}
