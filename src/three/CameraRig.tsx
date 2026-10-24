import { useEffect, useRef } from 'react'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { DUREE_TRANSITION, LIMITES_ENSEMBLE, VUE_ECRAN, VUE_ENSEMBLE } from '../config/scene'

type Props = {
  focus: boolean
}

export default function CameraRig({ focus }: Props) {
  const ref = useRef<CameraControlsImpl>(null)
  const premier = useRef(true)

  useEffect(() => {
    const c = ref.current
    if (!c) return

    // Pas d'animation au chargement, animation ensuite
    const anime = !premier.current
    premier.current = false

    // Pendant le trajet : aucune limite, et la souris ne peut pas interférer
    leverLimites(c)
    activerInteractions(c, false)

    const vue = focus ? VUE_ECRAN : VUE_ENSEMBLE
    const [px, py, pz] = vue.position
    const [tx, ty, tz] = vue.cible
    let annule = false

    c.setLookAt(px, py, pz, tx, ty, tz, anime).then(() => {
      if (annule || focus) return
      // Arrivée en vue d'ensemble : on rétablit les limites et la rotation
      Object.assign(c, LIMITES_ENSEMBLE)
      activerInteractions(c, true)
    })

    return () => {
      annule = true
    }
  }, [focus])

  return <CameraControls ref={ref} smoothTime={DUREE_TRANSITION} />
}

function leverLimites(c: CameraControlsImpl) {
  c.minDistance = 0
  c.maxDistance = Infinity
  c.minPolarAngle = 0
  c.maxPolarAngle = Math.PI
}

function activerInteractions(c: CameraControlsImpl, actives: boolean) {
  const A = CameraControlsImpl.ACTION
  c.mouseButtons.left = actives ? A.ROTATE : A.NONE
  c.mouseButtons.wheel = actives ? A.DOLLY : A.NONE
  c.mouseButtons.right = A.NONE
  c.touches.one = actives ? A.TOUCH_ROTATE : A.NONE
  c.touches.two = actives ? A.TOUCH_DOLLY : A.NONE
  c.touches.three = A.NONE
}
