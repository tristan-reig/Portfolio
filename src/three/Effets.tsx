import type { Object3D } from 'three'
import { EffectComposer, Outline, Vignette } from '@react-three/postprocessing'

type Props = {
  contour: Object3D[]
}

export default function Effets({ contour }: Props) {
  return (
    <EffectComposer autoClear={false} multisampling={2}>
      <Outline
        selection={contour}
        visibleEdgeColor={0xffffff}
        hiddenEdgeColor={0xffffff}
        edgeStrength={4}
        xRay={false}
      />
      <Vignette offset={0.3} darkness={0.45} />
    </EffectComposer>
  )
}
