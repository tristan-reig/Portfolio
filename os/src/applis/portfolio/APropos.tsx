import { lancerAppli } from '../lancer'
import CarteFrance from './CarteFrance'
import type { PropsRubrique } from './navigation'
import './APropos.css'

// Parcours, du plus récent au plus ancien
const PARCOURS = [
  { dates: '2026 –', titre: 'Master Informatique, parcours IMAGINE', lieu: 'Université de Montpellier' },
  { dates: '2025 –', titre: 'Formation en développement informatique', lieu: 'École 42, Perpignan' },
  { dates: '2023 – 2026', titre: 'Licence Informatique', lieu: 'Université de Montpellier' },
  { dates: '2020 – 2023', titre: 'Baccalauréat général, spécialités Mathématiques et NSI', lieu: 'Lycée Beauséjour, Narbonne' },
]

const COMPETENCES = [
  { titre: 'Langages', liste: ['C / C++', 'Python', 'JavaScript', 'Dart'] },
  { titre: 'Frameworks et bibliothèques', liste: ['React', 'Flask', 'OpenGL', 'Flutter'] },
  { titre: 'Langues', liste: ['Français : langue maternelle', 'Anglais : B2'] },
]

const EMAIL = 'tristan.reig@gmail.com'

export default function APropos({ aller }: PropsRubrique) {
  return (
    <div className="ap">
      <header className="ap-intro">
        <div>
          <h1>Bienvenue</h1>
          <p className="portfolio-chapo">Je m'appelle Tristan Reig, je suis étudiant en informatique à Montpellier.</p>
          <p>
            Je suis en Master IMAGINE à l'Université de Montpellier, un parcours tourné vers l'image, la 3D et le
            jeu vidéo, et je suis en parallèle la formation de l'École 42 à Perpignan.
          </p>
          <p>
            Je m'intéresse surtout à la programmation, à la modélisation 3D et à la conception d'applications. Ce
            portfolio en est un bon exemple : la scène 3D et le petit système d'exploitation affiché sur l'écran sont
            entièrement faits en React et Three.js.
          </p>
        </div>

        <figure className="ap-photo">
          <div className="ap-photo-vide">Photo</div>
        </figure>
      </header>

      <section>
        <h2>Parcours</h2>
        <ol className="ap-parcours">
          {PARCOURS.map((p) => (
            <li key={p.titre}>
              <span className="ap-dates">{p.dates}</span>
              <div>
                <strong>{p.titre}</strong>
                <span>{p.lieu}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Compétences</h2>
        <div className="ap-competences">
          {COMPETENCES.map((c) => (
            <div key={c.titre}>
              <h3>{c.titre}</h3>
              <ul>
                {c.liste.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="ap-recherche">
        <div>
          <h2>Ce que je cherche</h2>
          <p>
            Un stage de six mois, de janvier ou février à juin 2028, pour le second semestre de mon M2. Je suis
            ouvert à l'animation 3D, au jeu vidéo et au développement logiciel ou système, autour de Montpellier et
            de Perpignan.
          </p>
        </div>
        <CarteFrance />
      </section>

      <section>
        <h2>En dehors des études</h2>
        <p>
          En dehors de l'informatique, j'écoute énormément de musique, surtout de l'indie-pop. Ma playlist du moment
          tourne d'ailleurs dans l'appli{' '}
          <button className="ap-lien" onClick={() => lancerAppli('musique')}>
            Musique
          </button>{' '}
          de ce bureau. Je joue aussi aux jeux vidéo, plutôt des jeux de survie et de survival horror, et je suis le
          football de près, en particulier la Ligue des champions.
        </p>
      </section>

      <footer className="ap-fin">
        <p>
          Merci d'avoir pris le temps de lire tout ça !
        </p>
        <p>
          Si vous avez une question, une remarque ou une proposition de stage, je serai ravi d'en discuter. Vous
          pouvez me joindre depuis la{' '}
          <button className="ap-lien" onClick={() => aller('contact')}>
            page Contact
          </button>{' '}
          ou directement par e-mail à{' '}
          <a className="ap-lien" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
