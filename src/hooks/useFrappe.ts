import { useEffect, useRef, useState } from 'react'

// Les visiteurs qui ont demandé moins d'animations voient le texte directement
const mouvementReduit = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Options = {
  // La frappe ne commence que lorsque actif passe à true
  actif: boolean
  // Délai avant la première lettre (ms)
  debut: number
  // Délai moyen entre deux lettres (ms)
  vitesse: number
  // Irrégularité du rythme : 0 = parfaitement régulier, 0.6 = chaque délai varie de ±30 %
  variation: number
  // Pause entre deux lignes (ms)
  pause: number
  // Appelée à chaque lettre tapée, avec la lettre (pour le son)
  surLettre?: (lettre: string) => void
}

// Effet machine à écrire sur plusieurs lignes : chacune commence quand la précédente est finie.
// Une ligne finie suit ensuite les mises à jour de son texte (utile pour l'horloge).
export function useSequenceFrappe(textes: string[], options: Options) {
  const { actif, debut, vitesse, variation, pause } = options
  const fin = { ligne: textes.length, lettres: 0 }
  const [etat, setEtat] = useState(() => (mouvementReduit() ? fin : { ligne: 0, lettres: 0 }))

  // Valeurs lues pendant la frappe sans la relancer
  const textesRef = useRef(textes)
  textesRef.current = textes
  const surLettreRef = useRef(options.surLettre)
  surLettreRef.current = options.surLettre

  useEffect(() => {
    if (!actif || mouvementReduit()) return
    const longueurs = textesRef.current.map((t) => t.length)
    let ligne = 0
    let lettres = 0
    let minuteur: ReturnType<typeof setTimeout>

    const delai = () => vitesse * (1 - variation / 2 + Math.random() * variation)

    const taper = () => {
      surLettreRef.current?.(textesRef.current[ligne][lettres] ?? '')
      lettres += 1
      if (lettres < longueurs[ligne]) {
        setEtat({ ligne, lettres })
        minuteur = setTimeout(taper, delai())
        return
      }
      // Ligne finie : on passe à la suivante après une pause
      ligne += 1
      lettres = 0
      setEtat({ ligne, lettres })
      if (ligne < longueurs.length) minuteur = setTimeout(taper, pause)
    }

    setEtat({ ligne: 0, lettres: 0 })
    minuteur = setTimeout(taper, debut)
    return () => clearTimeout(minuteur)
  }, [actif, debut, vitesse, variation, pause])

  const lignes = textes.map((texte, i) => {
    if (i < etat.ligne) return { visible: true, texte }
    if (i === etat.ligne && etat.lettres > 0) return { visible: true, texte: texte.slice(0, etat.lettres) }
    // Le bloc n'apparaît qu'avec sa première lettre
    return { visible: false, texte: '' }
  })

  return { lignes, termine: etat.ligne >= textes.length }
}
