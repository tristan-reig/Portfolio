import { useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { useProgressionModele } from '../three/modele'
import { useOsPret } from '../three/osPret'

export default function Chargement() {
  const { part, termine } = useProgressionModele()
  const { progress, active } = useProgress()
  const sceneChargee = termine && !active && progress === 100
  const osPret = useOsPret(sceneChargee)
  const pret = sceneChargee && osPret

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
