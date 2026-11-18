import { Download, ExternalLink } from 'lucide-react'
import { EnTete, Fiche, Telephones } from './elements'

// Niveau 7 du jeu
const NIVEAU = ['33.22.33', '3.2112.3', '.211112.', '3.2112.3', '33.22.33']

// Palette du jeu
const PALETTE = [
  ['#3DFF7A', 'Vert'],
  ['#FFB000', 'Ambre'],
  ['#FF3D7F', 'Magenta'],
  ['#3DE8FF', 'Cyan'],
]

export default function PeaceBreak() {
  return (
    <>
      <EnTete
        titre="Peace Break"
        accroche="Un casse-briques arcade pour Android, avec classement en ligne et skins à débloquer."
        technos={['dart', 'flutter', 'supabase']}
        infos={[
          ['Cadre', '42'],
          ['Année', '2026'],
          ['Licence', 'GPL-3.0'],
        ]}
        liens={[
          { nom: 'Sur F-Droid', lien: 'https://f-droid.org/fr/packages/com.treig.peace_break/', Icone: Download },
          { nom: 'Code source', lien: 'https://github.com/tristan-reig/peace-break', Icone: ExternalLink },
        ]}
      />

      <Telephones
        captures={[
          ['projets/peace-break/menu.webp', 'Menu principal'],
          ['projets/peace-break/jeu.webp', 'En partie'],
          ['projets/peace-break/boutique.webp', 'Boutique'],
          ['projets/peace-break/classement.webp', 'Top 10'],
        ]}
      />

      <section className="pr-section">
        <h2>Le projet</h2>
        <p>
          Un casse-briques à l'esthétique de borne d'arcade : on renvoie la balle avec la raquette pour venir à bout de
          dix niveaux de difficulté croissante. Chaque niveau a son temps imparti, et le score dépend des briques
          cassées, du temps restant et des vies conservées.
        </p>
        <p>
          Les pièces gagnées en jouant servent à acheter des skins de raquette et de balle. Les comptes, la progression
          et le classement sont en ligne, si bien qu'on retrouve sa partie sur n'importe quel téléphone. L'application
          est publiée sur F-Droid, le magasin d'applications libres d'Android.
        </p>
      </section>

      <Fiche
        chiffres={[
          ['10', 'niveaux'],
          ['4', 'bonus et malus'],
          ['10', 'skins'],
          ['~4 500', 'lignes de code'],
        ]}
      />

      <section className="pr-section">
        <h2>Sous le capot</h2>

        <div className="pr-bloc">
          <div>
            <h3>Le jeu avec Flame</h3>
            <p>
              La partie tourne sur Flame, un moteur de jeu 2D pour Flutter : la raquette, la balle, les briques et les
              capsules de bonus sont des composants, et Flame gère les collisions entre eux.
            </p>
            <p>
              Les niveaux sont décrits par des grilles de huit colonnes, où chaque chiffre donne la résistance de la
              brique, de un à trois coups. Ci-contre, le septième.
            </p>
          </div>
          <div className="pr-briques" role="img" aria-label="Le septième niveau, dessiné à partir de sa grille">
            {NIVEAU.flatMap((ligne, y) =>
              [...ligne].map((c, x) => <span key={`${x}-${y}`} className={c === '.' ? undefined : `pr-brique-${c}`} />),
            )}
          </div>
        </div>

        <div className="pr-bloc pr-bloc-inverse">
          <div>
            <h3>L'esthétique arcade</h3>
            <p>
              Police pixel Press Start 2P, couleurs néon et un effet d'écran cathodique : des lignes de balayage et un
              assombrissement des bords sont dessinés par-dessus toute l'interface. Ci-contre, le même effet refait
              en CSS.
            </p>
            <ul className="pr-palette" aria-label="Palette du jeu">
              {PALETTE.map(([couleur, nom]) => (
                <li key={couleur}>
                  <span style={{ background: couleur, boxShadow: `0 0 14px ${couleur}66` }} />
                  <strong>{nom}</strong>
                  {couleur}
                </li>
              ))}
            </ul>
          </div>
          <div className="pr-crt" aria-hidden="true">
            <span className="pr-crt-titre">PEACE BREAK</span>
            <span className="pr-crt-start">PRESS START</span>
          </div>
        </div>

        <div className="pr-bloc pr-bloc-texte">
          <div>
            <h3>Le serveur avec Supabase</h3>
            <p>
              Comptes, progression et classement sont stockés dans une base PostgreSQL. Chaque joueur n'accède qu'à ses
              propres données, et les achats passent par une fonction SQL qui empêche de dépenser deux fois les mêmes
              pièces.
            </p>
          </div>
          <div>
            <h3>La publication sur F-Droid</h3>
            <p>
              F-Droid recompile chaque application depuis son code source : il a fallu une construction reproductible,
              avec une version de Flutter épinglée et un APK par architecture.
            </p>
          </div>
        </div>
      </section>

      <p className="pr-credits">
        Polices Press Start 2P et IBM Plex Mono (SIL Open Font License). Moteur{' '}
        <a href="https://flame-engine.org" target="_blank" rel="noreferrer">
          Flame
        </a>
        .
      </p>
    </>
  )
}
