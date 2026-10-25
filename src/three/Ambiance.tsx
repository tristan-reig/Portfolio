import { ContactShadows, Environment } from '@react-three/drei'

// Fond, éclairage d'environnement et ombre au sol
export default function Ambiance() {
  return (
    <>
      <color attach="background" args={['#cbcbd0']} />
      <Environment preset="city" />
      <ContactShadows frames={1} position={[0, 0, 0]} scale={6} blur={2.5} far={2} opacity={0.5} />
    </>
  )
}
