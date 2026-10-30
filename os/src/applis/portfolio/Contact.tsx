import { useState, type SubmitEvent } from 'react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6'
import { Check, FileDown, LoaderCircle, Send } from 'lucide-react'
import './Contact.css'

const EMAIL = 'tristan.reig@gmail.com'

const CV = `${import.meta.env.BASE_URL}cv/CV-Tristan-Reig.pdf`

const RESEAUX = [
  { nom: 'GitHub', lien: 'https://github.com/tristan-reig', Icone: FaGithub },
  { nom: 'LinkedIn', lien: 'https://www.linkedin.com/in/tristan-reig', Icone: FaLinkedinIn },
]

const ENVOI = import.meta.env.VITE_FORMULAIRE_URL as string | undefined

type Champs = { nom: string; email: string; entreprise: string; message: string }
const VIDE: Champs = { nom: '', email: '', entreprise: '', message: '' }
type Etat = 'saisie' | 'envoi' | 'envoye' | 'erreur'

const emailValide = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())

export default function Contact() {
  const [champs, setChamps] = useState<Champs>(VIDE)
  const [verifier, setVerifier] = useState(false)
  const [etat, setEtat] = useState<Etat>('saisie')

  const erreurs = {
    nom: !champs.nom.trim() && 'Indiquez votre nom.',
    email: !emailValide(champs.email) && 'Indiquez une adresse e-mail valide.',
    message: !champs.message.trim() && 'Écrivez votre message.',
  }
  const valide = !erreurs.nom && !erreurs.email && !erreurs.message

  const changer = (cle: keyof Champs) => (e: { target: { value: string } }) => {
    setChamps({ ...champs, [cle]: e.target.value })
    if (etat === 'erreur') setEtat('saisie')
  }

  const envoyer = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setVerifier(true)
    if (!valide || etat === 'envoi') return

    if (!ENVOI) {
      const sujet = `Contact portfolio : ${champs.nom}${champs.entreprise ? ` (${champs.entreprise})` : ''}`
      const corps = `${champs.message}\n\n${champs.nom}\n${champs.email}`
      window.open(`mailto:${EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`, '_blank')
      return
    }

    setEtat('envoi')
    try {
      const reponse = await fetch(ENVOI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(champs),
      })
      if (!reponse.ok) throw new Error(String(reponse.status))
      setEtat('envoye')
      setChamps(VIDE)
      setVerifier(false)
    } catch {
      setEtat('erreur')
    }
  }

  const erreur = (cle: keyof typeof erreurs) =>
    verifier && erreurs[cle] ? <span className="ct-erreur">{erreurs[cle]}</span> : null

  return (
    <div className="ct">
      <header className="ct-entete">
        <h1>Contact</h1>
        <ul className="ct-reseaux">
          {RESEAUX.map(({ nom, lien, Icone }) => (
            <li key={nom}>
              <a href={lien} target="_blank" rel="noreferrer" title={nom} aria-label={`Mon profil ${nom}`}>
                <Icone aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </header>

      <div className="ct-intro">
        <p>
          Je cherche un stage de six mois pour 2028. Si vous avez une proposition, ou simplement une question, n'hésitez
          pas à me contacter, je serai ravi d'en discuter ! Vous pouvez m'écrire directement par e-mail, ou passer par le
          formulaire.
        </p>
        <p className="ct-email">
          <strong>E-mail :</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
      </div>

      {etat === 'envoye' ? (
        <div className="ct-merci" role="status">
          <Check size={22} aria-hidden />
          <div>
            <strong>Message envoyé, merci !</strong>
            <p>Je vous réponds dès que possible.</p>
            <button className="ct-lien" onClick={() => setEtat('saisie')}>
              Écrire un autre message
            </button>
          </div>
        </div>
      ) : (
        <form className="ct-formulaire" onSubmit={envoyer} noValidate>
          <div className="ct-ligne">
            <label>
              <span className="ct-libelle">
                Nom <span className="ct-requis">*</span>
              </span>
              <input value={champs.nom} onChange={changer('nom')} autoComplete="name" aria-invalid={verifier && !!erreurs.nom} />
              {erreur('nom')}
            </label>
            <label>
              <span className="ct-libelle">
                E-mail <span className="ct-requis">*</span>
              </span>
              <input
                type="email"
                value={champs.email}
                onChange={changer('email')}
                autoComplete="email"
                aria-invalid={verifier && !!erreurs.email}
              />
              {erreur('email')}
            </label>
          </div>
          <label>
            <span className="ct-libelle">
              Entreprise <span className="ct-facultatif">(facultatif)</span>
            </span>
            <input value={champs.entreprise} onChange={changer('entreprise')} autoComplete="organization" />
          </label>
          <label>
            <span className="ct-libelle">
              Message <span className="ct-requis">*</span>
            </span>
            <textarea rows={7} value={champs.message} onChange={changer('message')} aria-invalid={verifier && !!erreurs.message} />
            {erreur('message')}
          </label>

          <div className="ct-actions">
            <button type="submit" className="ct-envoyer" disabled={etat === 'envoi'}>
              {etat === 'envoi' ? <LoaderCircle size={16} className="ct-tourne" aria-hidden /> : <Send size={16} aria-hidden />}
              {etat === 'envoi' ? 'Envoi…' : 'Envoyer'}
            </button>
            {etat === 'erreur' && (
              <span className="ct-erreur" role="alert">
                L'envoi a échoué. Réessayez, ou écrivez-moi directement à {EMAIL}.
              </span>
            )}
          </div>
        </form>
      )}

      <aside className="ct-cv">
        <span className="ct-cv-icone">
          <FileDown size={26} strokeWidth={1.8} aria-hidden />
        </span>
        <div>
          <strong>Besoin de mon CV ?</strong>
          <a href={CV} download>
            Cliquez ici pour le télécharger
          </a>
        </div>
      </aside>
    </div>
  )
}
