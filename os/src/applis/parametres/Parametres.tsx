import { useEffect, useState } from 'react'
import { Check, Info, Keyboard, Palette, RotateCcw, type LucideIcon } from 'lucide-react'
import { FONDS } from '../../fonds/fonds'
import { ACCENTS, PAR_DEFAUT, modifier, useReglages, type AccentId } from '../../reglages/reglages'
import './Parametres.css'

type SectionId = 'apparence' | 'raccourcis' | 'apropos'

const SECTIONS: { id: SectionId; titre: string; Icone: LucideIcon }[] = [
  { id: 'apparence', titre: 'Apparence', Icone: Palette },
  { id: 'raccourcis', titre: 'Raccourcis clavier', Icone: Keyboard },
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
            {section === 'raccourcis' && <Raccourcis />}
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
        <label className="pa-interrupteur">
          <span>
            <strong>Réduire les animations</strong>
            <span className="pa-aide">Les fenêtres, menus et transitions s'affichent sans mouvement.</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={r.animationsReduites}
            onChange={(e) => modifier({ animationsReduites: e.target.checked })}
          />
        </label>
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
  onChange,
}: {
  nom: string
  aide?: string
  valeur: number
  min: number
  max: number
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
      <output>{valeur} px</output>
    </label>
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

// ——— À propos, façon neofetch ———

const LOGO = [
  '████████ ██████ ',
  '   ██    ██   ██',
  '   ██    ██████ ',
  '   ██    ██  ██ ',
  '   ██    ██   ██',
].join('\n')

const DEBUT = Date.now()

const CREDITS: [string, string, string][] = [
  ['Idée et sons', 'Portfolio de Henry Heffernan', 'MIT'],
  ['Icônes', 'Lucide, Simple Icons', 'ISC, CC0'],
  ['Polices', 'JetBrains Mono, Fraunces, Press Start 2P', 'SIL OFL'],
  ['Carte de France', 'Natural Earth', 'Domaine public'],
  ['Mots du Wordle', 'an-array-of-french-words, an-array-of-english-words', 'MIT'],
  ['Paroles', 'LRCLIB', ''],
]

function APropos() {
  const r = useReglages()
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), 1000)
    return () => clearInterval(minuteur)
  }, [])

  const secondes = Math.floor((maintenant - DEBUT) / 1000)
  const duree = secondes < 60 ? `${secondes} s` : `${Math.floor(secondes / 60)} min ${secondes % 60} s`

  const infos: [string, string][] = [
    ['Système', 'TR-OS 1.0, inspiré de Hyprland'],
    ['Interface', 'React 19, TypeScript'],
    ['Scène 3D', 'Three.js r186, React Three Fiber'],
    ['Outils', 'Vite 8, Blender'],
    ['Résolution', `${window.innerWidth} × ${window.innerHeight}`],
    ['Allumé depuis', duree],
    ['Thème', `${ACCENTS[r.accent].nom}, ${FONDS.find((f) => f.id === r.fond)?.nom ?? ''}`],
    ['Police', 'JetBrains Mono'],
  ]

  return (
    <>
      <div className="pa-neofetch">
        <pre className="pa-logo" aria-hidden="true">
          {LOGO}
        </pre>
        <div>
          <p className="pa-utilisateur">
            <span>visiteur</span>@<span>tristan-reig</span>
          </p>
          <p className="pa-trait" aria-hidden="true">
            {'─'.repeat(21)}
          </p>
          <dl className="pa-infos">
            {infos.map(([nom, valeur]) => (
              <div key={nom}>
                <dt>{nom}</dt>
                <dd>{valeur}</dd>
              </div>
            ))}
          </dl>
          <div className="pa-couleurs" aria-hidden="true">
            {['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#94e2d5', '#89b4fa', '#cba6f7', '#f5c2e7'].map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      <section className="pa-groupe">
        <h3>Crédits</h3>
        <dl className="pa-credits">
          {CREDITS.map(([quoi, qui, licence]) => (
            <div key={quoi}>
              <dt>{quoi}</dt>
              <dd>
                {qui}
                {licence && <span>{licence}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p className="pa-aide">
          Conçu et développé par Tristan Reig.{' '}
          <a href="https://github.com/tristan-reig" target="_blank" rel="noreferrer">
            github.com/tristan-reig
          </a>
        </p>
      </section>
    </>
  )
}
