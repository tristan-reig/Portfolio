import { useCallback, useEffect, useRef, useState } from 'react'
import { infosAppli, type AppliId } from './applis/applis'
import Barre from './barre/Barre'
import Fenetres from './fenetres/Fenetres'
import { useFenetres } from './fenetres/useFenetres'
import SelecteurFonds from './fonds/SelecteurFonds'
import { useFond } from './fonds/useFond'
import { lireReglages, useReglages } from './reglages/reglages'
import { EVENEMENT_LANCER } from './applis/lancer'
import { deverrouiller, useVerrouille, verrouiller } from './verrouillage/etat'
import { useRedemarrage } from './redemarrage/etat'
import Redemarrage from './redemarrage/Redemarrage'
import Verrouillage from './verrouillage/Verrouillage'

export default function App() {
  const redemarrage = useRedemarrage()
  const [allume, setAllume] = useState(true)
  const [demarrage, setDemarrage] = useState(0)

  const eteindre = useCallback(() => {
    setAllume(false)
    deverrouiller()
  }, [])
  // Démarrage sur l'écran de verrouillage
  const allumer = useCallback(() => {
    setDemarrage((n) => n + 1)
    setAllume(true)
    verrouiller()
  }, [])

  return (
    <>
      {allume && <Bureau key={demarrage} />}
      {redemarrage && <Redemarrage onEteindre={eteindre} onAllumer={allumer} />}
    </>
  )
}

function Bureau() {
  const [fond, choisirFond] = useFond()
  const [selecteur, setSelecteur] = useState(false)
  const verrouille = useVerrouille()
  const { fenetres, active, ouvrir, fermer, activer, echanger } = useFenetres(lireReglages().demarrage)

  // Une appli déjà ouverte est mise au premier plan
  const lancer = (appli: AppliId) => {
    const ouverte = fenetres.find((f) => f.appli === appli && !f.fermeture)
    if (ouverte) activer(ouverte.id)
    else ouvrir(appli)
  }

  // Verrouillage automatique après quelques minutes
  const { verrouAuto } = useReglages()
  useEffect(() => {
    if (!verrouAuto) return
    let minuteur = 0
    const relancer = () => {
      clearTimeout(minuteur)
      minuteur = window.setTimeout(verrouiller, verrouAuto * 60_000)
    }
    const evenements = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const
    evenements.forEach((e) => window.addEventListener(e, relancer, { passive: true }))
    relancer()
    return () => {
      clearTimeout(minuteur)
      evenements.forEach((e) => window.removeEventListener(e, relancer))
    }
  }, [verrouAuto])

  const lancerRef = useRef(lancer)
  useEffect(() => {
    lancerRef.current = lancer
  })
  useEffect(() => {
    const surLancer = (e: Event) => lancerRef.current((e as CustomEvent<AppliId>).detail)
    window.addEventListener(EVENEMENT_LANCER, surLancer)
    return () => window.removeEventListener(EVENEMENT_LANCER, surLancer)
  }, [])

  const fenetreActive = fenetres.find((f) => f.id === active && !f.fermeture)

  return (
    <div className="bureau" style={{ background: fond.fond }}>
      <Fenetres fenetres={fenetres} active={active} onActiver={activer} onFermer={fermer} onEchanger={echanger} />
      <Barre
        active={fenetreActive ? infosAppli(fenetreActive.appli) : null}
        onLancer={lancer}
        onFonds={() => setSelecteur(true)}
        onMusique={() => {
          const musique = fenetres.find((f) => f.appli === 'musique' && !f.fermeture)
          if (musique) activer(musique.id)
        }}
      />
      {selecteur && (
        <SelecteurFonds actuel={fond} onChoisir={choisirFond} onFermer={() => setSelecteur(false)} />
      )}
      {verrouille && <Verrouillage />}
    </div>
  )
}
