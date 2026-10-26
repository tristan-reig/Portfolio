import { use, useSyncExternalStore } from 'react'
import { useGLTF } from '@react-three/drei'
import { MODELE } from '../config/scene'

// Téléchargement de scene.glb en comptant les octets reçus, pour afficher un vrai pourcentage.

type Progression = {
  part: number | null
  termine: boolean
}

let progression: Progression = { part: 0, termine: false }
const abonnes = new Set<() => void>()

function publier(nouvelle: Progression) {
  progression = nouvelle
  abonnes.forEach((abonne) => abonne())
}

async function telecharger(): Promise<string> {
  try {
    const reponse = await fetch(MODELE)
    if (!reponse.ok || !reponse.body) throw new Error(`${reponse.status} sur ${MODELE}`)

    const total = Number(reponse.headers.get('Content-Length')) || 0
    const lecteur = reponse.body.getReader()
    const morceaux: Uint8Array<ArrayBuffer>[] = []
    let recu = 0

    for (;;) {
      const { done, value } = await lecteur.read()
      if (done) break
      morceaux.push(value)
      recu += value.length
      publier({ part: total ? Math.min(recu / total, 0.99) : null, termine: false })
    }

    publier({ part: 1, termine: true })
    // Le fichier reste en mémoire : useGLTF le lit depuis cette adresse locale, sans le retélécharger
    return URL.createObjectURL(new Blob(morceaux, { type: 'model/gltf-binary' }))
  } catch (erreur) {
    console.warn('Téléchargement suivi impossible, chargement classique :', erreur)
    publier({ part: null, termine: true })
    return MODELE
  }
}

const adresse = typeof window !== 'undefined' ? telecharger() : Promise.resolve(MODELE)

// Suspend le rendu tant que le fichier n'est pas téléchargé et lu
export function useModele() {
  return useGLTF(use(adresse))
}

// Progression du téléchargement, pour l'écran de chargement
export function useProgressionModele() {
  return useSyncExternalStore(
    (abonne) => {
      abonnes.add(abonne)
      return () => abonnes.delete(abonne)
    },
    () => progression,
  )
}
