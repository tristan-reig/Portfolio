import { useState } from 'react'
import './Calendrier.css'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const formatMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const formatJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)

type Props = {
  aujourdhui: Date
}

const memeJour = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// Les 42 jours affichés
function joursDuMois(annee: number, mois: number) {
  const premier = new Date(annee, mois, 1)
  const decalage = (premier.getDay() + 6) % 7 // lundi = 0
  return Array.from({ length: 42 }, (_, i) => new Date(annee, mois, 1 - decalage + i))
}

export default function Calendrier({ aujourdhui }: Props) {
  const [vue, setVue] = useState({ annee: aujourdhui.getFullYear(), mois: aujourdhui.getMonth() })
  const jours = joursDuMois(vue.annee, vue.mois)
  const titre = formatMois.format(new Date(vue.annee, vue.mois, 1))

  const changerMois = (pas: number) => {
    const d = new Date(vue.annee, vue.mois + pas, 1)
    setVue({ annee: d.getFullYear(), mois: d.getMonth() })
  }
  const surMoisCourant = vue.annee === aujourdhui.getFullYear() && vue.mois === aujourdhui.getMonth()

  return (
    <div className="calendrier" role="dialog" aria-label="Calendrier">
      <div className="calendrier-heure">{formatHeure.format(aujourdhui)}</div>
      <div className="calendrier-date">{majuscule(formatJour.format(aujourdhui))}</div>

      <div className="calendrier-entete">
        <button className="calendrier-fleche" onClick={() => changerMois(-1)} aria-label="Mois précédent">‹</button>
        <button
          className="calendrier-titre"
          onClick={() => setVue({ annee: aujourdhui.getFullYear(), mois: aujourdhui.getMonth() })}
          disabled={surMoisCourant}
          title="Revenir à aujourd'hui"
        >
          {majuscule(titre)}
        </button>
        <button className="calendrier-fleche" onClick={() => changerMois(1)} aria-label="Mois suivant">›</button>
      </div>

      <div className="calendrier-grille">
        {JOURS.map((j) => (
          <span key={j} className="calendrier-jour-semaine">{j}</span>
        ))}
        {jours.map((d) => {
          const classes = ['calendrier-jour']
          if (d.getMonth() !== vue.mois) classes.push('calendrier-hors-mois')
          if (memeJour(d, aujourdhui)) classes.push('calendrier-aujourdhui')
          return (
            <span key={d.toISOString()} className={classes.join(' ')}>
              {d.getDate()}
            </span>
          )
        })}
      </div>
    </div>
  )
}
