import { ExternalLink } from 'lucide-react'
import { Capture, EnTete, Fiche } from './elements'

// Extrait du premier niveau : chaque caractère est une case de la carte
const NIVEAU = `##########################
#>.3...#....r..T.........#
#......#...Z...T....I....#
#..+...#.......T.........#
#......#..bb...TTTTDTTTTT#
#......###D####..........#
#..........a.......X..b..#`

const LEGENDE = [
  ['#  T  M', 'murs (briques, tuyaux, métal)'],
  ['D', 'porte'],
  ['Z  I  X', 'zombie, imp, démon'],
  ['>', 'départ du joueur'],
  ['b', 'baril explosif'],
]

// Page du projet Doom-like
export default function DoomLike() {
  return (
    <>
      <EnTete
        titre="Doom-like"
        accroche="Un jeu de tir à la Doom, codé de zéro en Lua."
        infos={[
          ['Langages', 'Lua, GLSL'],
          ['Moteur', 'LÖVE 11.5'],
          ['Cadre', 'Projet personnel'],
          ['Date', 'Novembre 2026'],
        ]}
        liens={[{ nom: 'Code source', lien: 'https://github.com/tristan-reig/doom-like', Icone: ExternalLink }]}
      />

      {/* Image dans os/public/projets/doom-like/ (à défaut, un cadre vide s'affiche) */}
      <Capture image="projets/doom-like/jeu.png" legende="Le premier niveau, avec la barre d'état et le visage du joueur" grande />

      <section className="pr-section">
        <h2>Le projet</h2>
        <p>
          Un jeu de tir en vue subjective inspiré du Doom de 1993, écrit sans moteur 3D : la 3D est simulée par
          raycasting, la technique de Wolfenstein 3D. On y traverse deux niveaux avec trois armes (pistolet, fusil à
          pompe, mitrailleuse) face à trois monstres : le zombie, l'imp et le démon.
        </p>
        <p>
          On y retrouve ce qui fait un Doom : portes et cartes d'accès de couleur, objets à ramasser (soins,
          munitions, armure), barils explosifs, la barre d'état avec le visage du joueur qui réagit aux coups, et quatre
          niveaux de difficulté, de « Trop jeune pour mourir » à « Ultra-violence ».
        </p>
      </section>

      <Fiche
        chiffres={[
          ['3 281', 'lignes de Lua'],
          ['6', 'jours de développement'],
          ['2', 'niveaux'],
          ['3', 'monstres, 3 armes'],
        ]}
      />

      <section className="pr-section">
        <h2>Sous le capot</h2>

        <div className="pr-bloc">
          <div>
            <h3>Le rendu par raycasting</h3>
            <p>
              Pour chaque colonne de l'écran, un rayon part du joueur et traverse la carte case par case (algorithme
              DDA) jusqu'à toucher un mur. Sa distance donne la hauteur du mur à dessiner, et le point d'impact la
              colonne de texture à afficher. Les murs s'assombrissent avec la distance.
            </p>
            <p>
              Le sol et le plafond sont calculés pixel par pixel dans un shader GLSL, qui retrouve pour chaque point de
              l'écran la position correspondante dans le monde.
            </p>
          </div>
          <Capture image="projets/doom-like/rendu.png" legende="Murs, sol et plafond texturés" />
        </div>

        <div className="pr-bloc pr-bloc-inverse">
          <div>
            <h3>Les monstres</h3>
            <p>
              Chaque monstre est un sprite dessiné en huit directions : l'image affichée dépend de l'angle sous lequel
              on le regarde. Les sprites sont triés par distance et masqués colonne par colonne par les murs déjà
              dessinés.
            </p>
            <p>
              Les monstres se réveillent quand ils voient le joueur, en lançant un rayon vers lui, ou quand ils
              l'entendent : le bruit d'un tir se propage dans la carte par un parcours en largeur, qui passe par les
              portes ouvertes mais pas par les portes fermées.
            </p>
          </div>
          <Capture image="projets/doom-like/monstres.png" legende="Un imp et des zombies" />
        </div>

        <div className="pr-bloc">
          <div>
            <h3>Des niveaux en texte</h3>
            <p>
              Les niveaux sont de simples fichiers texte : chaque caractère est une case, mur, porte, monstre ou objet.
              On peut ainsi dessiner une carte dans un éditeur de texte et la tester aussitôt.
            </p>
            <dl className="pr-legende">
              {LEGENDE.map(([c, sens]) => (
                <div key={c}>
                  <dt>{c}</dt>
                  <dd>{sens}</dd>
                </div>
              ))}
            </dl>
          </div>
          <pre className="pr-niveau" aria-label="Extrait du fichier du premier niveau">
            {NIVEAU}
          </pre>
        </div>
      </section>

      <p className="pr-credits">
        Graphismes et sons du projet <a href="https://freedoom.github.io" target="_blank" rel="noreferrer">Freedoom</a>{' '}
        (licence BSD). Moteur <a href="https://love2d.org" target="_blank" rel="noreferrer">LÖVE</a>.
      </p>
    </>
  )
}
