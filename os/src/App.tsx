import { useCallback, useEffect, useRef, useState } from 'react'
import { AU_DEMARRAGE, infosAppli, type AppliId } from './applis/applis'
import Barre from './barre/Barre'
import Fenetres from './fenetres/Fenetres'
import { useFenetres } from './fenetres/useFenetres'
import SelecteurFonds from './fonds/SelecteurFonds'
import { useFond } from './fonds/useFond'
import { EVENEMENT_LANCER } from './applis/lancer'
import { deverrouiller, useVerrouille, verrouiller } from './verrouillage/etat'
import { useRedemarrage } from './redemarrage/etat'
import Redemarrage from './redemarrage/Redemarrage'
import Verrouillage from './verrouillage/Verrouillage'

// L'OS : le bureau, et la séquence de redémarrage par-dessus quand on la demande
export default function App() {
  const redemarrage = useRedemarrage()
  const [allume, setAllume] = useState(true)
  // Chaque démarrage crée un bureau tout neuf : fenêtres de départ, musique arrêtée…
  const [demarrage, setDemarrage] = useState(0)

  const eteindre = useCallback(() => {
    setAllume(false)
    deverrouiller()
  }, [])
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

// Bureau de l'OS, dans l'esprit de Hyprland : fond d'écran, barre système et fenêtres en mosaïque
function Bureau() {
  const [fond, choisirFond] = useFond()
  const [selecteur, setSelecteur] = useState(false)
  const verrouille = useVerrouille()
  const { fenetres, active, ouvrir, fermer, activer, echanger } = useFenetres(AU_DEMARRAGE)

  // Une appli déjà ouverte est simplement mise au premier plan (pas deux lecteurs de musique à la fois)
  const lancer = (appli: AppliId) => {
    const ouverte = fenetres.find((f) => f.appli === appli && !f.fermeture)
    if (ouverte) activer(ouverte.id)
    else ouvrir(appli)
  }

  // Une appli peut en ouvrir une autre (voir applis/lancer.ts)
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
