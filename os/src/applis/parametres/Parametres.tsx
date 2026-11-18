import { useState } from 'react'
import { Check, Database, Info, Keyboard, Monitor, Palette, RotateCcw, Trash2, Volume2, type LucideIcon } from 'lucide-react'
import { FONDS } from '../../fonds/fonds'
import { redemarrer } from '../../redemarrage/etat'
import { ACCENTS, PAR_DEFAUT, modifier, reinitialiserReglages, useReglages, type AccentId } from '../../reglages/reglages'
import { toutesLesApplis, type AppliId } from '../applis'
import './Parametres.css'

type SectionId = 'apparence' | 'son' | 'bureau' | 'raccourcis' | 'donnees' | 'apropos'

const SECTIONS: { id: SectionId; titre: string; Icone: LucideIcon }[] = [
  { id: 'apparence', titre: 'Apparence', Icone: Palette },
  { id: 'son', titre: 'Son', Icone: Volume2 },
  { id: 'bureau', titre: 'Bureau', Icone: Monitor },
  { id: 'raccourcis', titre: 'Raccourcis clavier', Icone: Keyboard },
  { id: 'donnees', titre: 'Données', Icone: Database },
  { id: 'apropos', titre: 'À propos', Icone: Info },
]

export default function Parametres() {
  const [section, setSection] = useState<SectionId>('apparence')

  return (
    <div className="pa-cadre">
      <div className="pa">
        <nav className="pa-menu" aria-label="Sections">
          <h1>Paramètres</h1>
          {SECTIONS.map(({ id, titre, Icone }) => (
            <button
              key={id}
              className={id === section ? 'pa-menu-actif' : undefined}
              aria-current={id === section ? 'page' : undefined}
              onClick={() => setSection(id)}
            >
              <Icone size={16} aria-hidden />
              {titre}
            </button>
          ))}
        </nav>

        <div className="pa-contenu">
          <div key={section} className="pa-page">
            {section === 'apparence' && <Apparence />}
            {section === 'son' && <Son />}
            {section === 'bureau' && <Bureau />}
            {section === 'raccourcis' && <Raccourcis />}
            {section === 'donnees' && <Donnees />}
            {section === 'apropos' && <APropos />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ——— Apparence ———

function Apparence() {
  const r = useReglages()
  const parDefaut =
    r.fond === PAR_DEFAUT.fond &&
    r.accent === PAR_DEFAUT.accent &&
    r.espace === PAR_DEFAUT.espace &&
    r.arrondi === PAR_DEFAUT.arrondi

  return (
    <>
      <h2>Apparence</h2>

      <section className="pa-groupe">
        <h3>Fond d'écran</h3>
        <ul className="pa-fonds">
          {FONDS.map((f) => (
            <li key={f.id}>
              <button
                className={f.id === r.fond ? 'pa-choisi' : undefined}
                style={{ background: f.fond }}
                onClick={() => modifier({ fond: f.id })}
                aria-pressed={f.id === r.fond}
                title={f.nom}
              >
                {f.id === r.fond && <Check size={16} aria-hidden />}
              </button>
              <span>{f.nom}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pa-groupe">
        <h3>Couleur d'accent</h3>
        <p className="pa-aide">Les boutons, les liens et la bordure de la fenêtre active.</p>
        <ul className="pa-accents">
          {(Object.entries(ACCENTS) as [AccentId, (typeof ACCENTS)[AccentId]][]).map(([id, a]) => (
            <li key={id}>
              <button
                className={id === r.accent ? 'pa-choisi' : undefined}
                style={{ background: `linear-gradient(135deg, ${a.bordure[0]}, ${a.bordure[1]})` }}
                onClick={() => modifier({ accent: id })}
                aria-pressed={id === r.accent}
                aria-label={a.nom}
              >
                {id === r.accent && <Check size={16} aria-hidden />}
              </button>
              <span>{a.nom}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pa-groupe">
        <h3>Fenêtres</h3>
        <Reglette
          nom="Espacement"
          aide="La marge entre les fenêtres et autour d'elles."
          valeur={r.espace}
          min={0}
          max={24}
          onChange={(espace) => modifier({ espace })}
        />
        <Reglette
          nom="Arrondi des coins"
          valeur={r.arrondi}
          min={0}
          max={20}
          onChange={(arrondi) => modifier({ arrondi })}
        />
      </section>

      <section className="pa-groupe">
        <h3>Accessibilité</h3>
        <Interrupteur
          nom="Réduire les animations"
          aide="Les fenêtres, menus et transitions s'affichent sans mouvement."
          actif={r.animationsReduites}
          onChange={(animationsReduites) => modifier({ animationsReduites })}
        />
      </section>

      <button
        className="pa-bouton"
        disabled={parDefaut}
        onClick={() =>
          modifier({ fond: PAR_DEFAUT.fond, accent: PAR_DEFAUT.accent, espace: PAR_DEFAUT.espace, arrondi: PAR_DEFAUT.arrondi })
        }
      >
        <RotateCcw size={14} aria-hidden /> Rétablir l'apparence par défaut
      </button>
    </>
  )
}

function Reglette({
  nom,
  aide,
  valeur,
  min,
  max,
  unite = 'px',
  onChange,
}: {
  nom: string
  aide?: string
  valeur: number
  min: number
  max: number
  unite?: string
  onChange: (v: number) => void
}) {
  return (
    <label className="pa-reglette">
      <span>
        <strong>{nom}</strong>
        {aide && <span className="pa-aide">{aide}</span>}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--rempli': `${((valeur - min) / (max - min)) * 100}%` } as React.CSSProperties}
      />
      <output>
        {valeur} {unite}
      </output>
    </label>
  )
}

function Interrupteur({
  nom,
  aide,
  actif,
  onChange,
}: {
  nom: string
  aide: string
  actif: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="pa-interrupteur">
      <span>
        <strong>{nom}</strong>
        <span className="pa-aide">{aide}</span>
      </span>
      <input type="checkbox" role="switch" checked={actif} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

// ——— Son ———

function Son() {
  const r = useReglages()
  return (
    <>
      <h2>Son</h2>
      <section className="pa-groupe">
        <h3>Musique</h3>
        <Reglette
          nom="Volume"
          aide="Le même réglage que dans l'appli Musique."
          valeur={r.volume}
          min={0}
          max={100}
          unite="%"
          onChange={(volume) => modifier({ volume })}
        />
      </section>
      <section className="pa-groupe">
        <h3>Scène 3D</h3>
        <Interrupteur
          nom="Bruits du clavier"
          aide="Le son des touches quand on tape sur le clavier du bureau en 3D."
          actif={r.sonsScene}
          onChange={(sonsScene) => modifier({ sonsScene })}
        />
      </section>
    </>
  )
}

// ——— Bureau ———

const DELAIS = [
  [0, 'Jamais'],
  [2, '2 min'],
  [5, '5 min'],
  [10, '10 min'],
] as const

function Bureau() {
  const r = useReglages()
  const basculer = (id: AppliId) =>
    modifier({ demarrage: r.demarrage.includes(id) ? r.demarrage.filter((a) => a !== id) : [...r.demarrage, id] })

  return (
    <>
      <h2>Bureau</h2>
      <section className="pa-groupe">
        <h3>Ouvertes au démarrage</h3>
        <p className="pa-aide">Les fenêtres qui s'ouvrent à l'arrivée sur l'écran et après un redémarrage.</p>
        <ul className="pa-applis">
          {toutesLesApplis().map(([id, a]) => (
            <li key={id}>
              <label>
                <span className="pa-applis-icone" style={{ background: a.couleur }}>
                  <a.Icone size={16} strokeWidth={1.8} aria-hidden />
                </span>
                {a.titre}
                <input type="checkbox" checked={r.demarrage.includes(id)} onChange={() => basculer(id)} />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="pa-groupe">
        <h3>Verrouillage automatique</h3>
        <p className="pa-aide">L'écran se verrouille après ce délai sans souris ni clavier.</p>
        <div className="pa-choix" role="radiogroup" aria-label="Délai avant le verrouillage">
          {DELAIS.map(([minutes, nom]) => (
            <button
              key={minutes}
              role="radio"
              aria-checked={r.verrouAuto === minutes}
              className={r.verrouAuto === minutes ? 'pa-choisi' : undefined}
              onClick={() => modifier({ verrouAuto: minutes })}
            >
              {nom}
            </button>
          ))}
        </div>
      </section>
    </>
  )
}

// ——— Données ———

// Ce que l'OS garde dans le navigateur du visiteur
const PREFIXES = ['os-', 'mot-', 'connexions-']

function Donnees() {
  const [confirmer, setConfirmer] = useState(false)

  const reinitialiser = () => {
    try {
      Object.keys(localStorage)
        .filter((cle) => PREFIXES.some((p) => cle.startsWith(p)))
        .forEach((cle) => localStorage.removeItem(cle))
    } catch {
      // Stockage indisponible
    }
    reinitialiserReglages()
    redemarrer()
  }

  return (
    <>
      <h2>Données</h2>
      <section className="pa-groupe">
        <h3>Enregistré dans ce navigateur</h3>
        <ul className="pa-liste">
          <li>Les réglages : fond d'écran, couleurs, fenêtres, son et bureau</li>
          <li>La progression du Wordle et de Connections</li>
        </ul>
        <p className="pa-aide">Rien n'est envoyé sur un serveur : tout reste sur cet appareil.</p>
      </section>

      <section className="pa-groupe">
        <h3>Réinitialiser</h3>
        <div className="pa-danger">
          <span>
            <strong>Tout effacer et redémarrer</strong>
            <span className="pa-aide">Les réglages reviennent par défaut et les parties sont perdues.</span>
          </span>
          {confirmer ? (
            <span className="pa-danger-boutons">
              <button className="pa-bouton" onClick={() => setConfirmer(false)}>
                Annuler
              </button>
              <button className="pa-bouton pa-bouton-danger" onClick={reinitialiser}>
                Confirmer
              </button>
            </span>
          ) : (
            <button className="pa-bouton pa-bouton-danger" onClick={() => setConfirmer(true)}>
              <Trash2 size={14} aria-hidden /> Réinitialiser
            </button>
          )}
        </div>
      </section>
    </>
  )
}

// ——— Raccourcis clavier ———

const RACCOURCIS: { groupe: string; liste: [string[], string][] }[] = [
  {
    groupe: 'Bureau',
    liste: [
      [['Ctrl', 'K'], 'Ouvrir ou fermer le lanceur d’applis'],
      [['Ctrl', 'Maj', '← ↑ ↓ →'], 'Échanger la fenêtre active avec sa voisine'],
      [['Espace'], 'Mettre la musique en pause ou la relancer'],
    ],
  },
  {
    groupe: 'Portfolio',
    liste: [
      [['Alt', '←'], 'Page précédente'],
      [['Alt', '→'], 'Page suivante'],
    ],
  },
  {
    groupe: 'Lanceur et menus',
    liste: [
      [['← ↑ ↓ →'], 'Se déplacer dans la liste'],
      [['Entrée'], 'Ouvrir ou valider'],
      [['Échap'], 'Fermer'],
    ],
  },
  {
    groupe: 'Scène 3D',
    liste: [[['Échap'], "Quitter l'écran et revenir au bureau en 3D"]],
  },
]

function Raccourcis() {
  return (
    <>
      <h2>Raccourcis clavier</h2>
      {RACCOURCIS.map(({ groupe, liste }) => (
        <section key={groupe} className="pa-groupe">
          <h3>{groupe}</h3>
          <dl className="pa-raccourcis">
            {liste.map(([touches, action]) => (
              <div key={action}>
                <dt>
                  {touches.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span className="pa-plus">+</span>}
                      <kbd>{t}</kbd>
                    </span>
                  ))}
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </>
  )
}

// ——— À propos ———

const SYSTEME: [string, string][] = [
  ['Système', 'TR-OS 1.0, inspiré de Hyprland'],
  ['Interface', 'React 19, TypeScript'],
  ['Scène 3D', 'Three.js, React Three Fiber, Blender'],
  ['Outils', 'Vite 8'],
]

const CREDITS: [string, string, string][] = [
  ['Idée et sons', 'Portfolio de Henry Heffernan', 'MIT'],
  ['Icônes', 'Lucide, Simple Icons', 'ISC, CC0'],
  ['Polices', 'JetBrains Mono, Fraunces, Press Start 2P', 'SIL OFL'],
  ['Carte de France', 'Natural Earth', 'Domaine public'],
  ['Mots du Wordle', 'an-array-of-french-words, an-array-of-english-words', 'MIT'],
  ['Paroles', 'LRCLIB', ''],
]

function Lignes({ lignes }: { lignes: [string, string, string?][] }) {
  return (
    <dl className="pa-credits">
      {lignes.map(([quoi, qui, licence]) => (
        <div key={quoi}>
          <dt>{quoi}</dt>
          <dd>
            {qui}
            {licence && <span>{licence}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function APropos() {
  return (
    <>
      <h2>À propos</h2>
      <section className="pa-groupe">
        <h3>Système</h3>
        <Lignes lignes={SYSTEME} />
      </section>
      <section className="pa-groupe">
        <h3>Crédits</h3>
        <Lignes lignes={CREDITS} />
        <p className="pa-aide pa-signature">
          Conçu et développé par Tristan Reig.{' '}
          <a href="https://github.com/tristan-reig" target="_blank" rel="noreferrer">
            github.com/tristan-reig
          </a>
        </p>
      </section>
    </>
  )
}
