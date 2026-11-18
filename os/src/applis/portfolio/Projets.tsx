import { ArrowRight } from 'lucide-react'
import type { PropsRubrique } from './navigation'
import { PROJETS, VOLETS, type Projet } from './projets/donnees'
import { Technos } from './projets/technos'
import './Projets.css'

export default function Projets({ page, naviguer }: PropsRubrique) {
  const volet = VOLETS.find((v) => v.id === page.volet)
  const projet = volet && PROJETS.find((p) => p.id === page.projet && p.volet === volet.id && p.Page)

  // Fil d'Ariane
  const fil = [
    { nom: 'Projets', page: { rubrique: 'projets' as const } },
    ...(volet ? [{ nom: volet.titre, page: { rubrique: 'projets' as const, volet: volet.id } }] : []),
    ...(projet ? [{ nom: projet.titre, page: { rubrique: 'projets' as const, volet: volet!.id, projet: projet.id } }] : []),
  ]
  const ariane = (
    <nav className="pj-fil" aria-label="Fil d'Ariane">
      {fil.map((f, i) => (
        <span key={f.nom}>
          {i > 0 && <span className="pj-fil-sep">/</span>}
          {i === fil.length - 1 ? (
            <span className="pj-fil-courant" aria-current="page">
              {f.nom}
            </span>
          ) : (
            <button onClick={() => naviguer(f.page)}>{f.nom}</button>
          )}
        </span>
      ))}
    </nav>
  )

  if (volet && projet?.Page) {
    return (
      <div className="pj pj-projet">
        {ariane}
        <projet.Page />
      </div>
    )
  }

  if (volet) {
    const projets = PROJETS.filter((p) => p.volet === volet.id)
    return (
      <div className="pj">
        {ariane}
        <h1>{volet.titre}</h1>
        <p className="portfolio-chapo">{volet.sousTitre}</p>

        {projets.length === 0 ? (
          <p className="portfolio-doux">Contenu à venir.</p>
        ) : (
          <ul className="pj-liste">
            {projets.map((p) => (
              <li key={p.id}>
                <button
                  className="pj-carte"
                  onClick={() => naviguer({ rubrique: 'projets', volet: volet.id, projet: p.id })}
                  disabled={!p.Page}
                >
                  <Vignette projet={p} />
                  <span className="pj-carte-corps">
                    <span className="pj-carte-titre">
                      <strong>{p.titre}</strong>
                      {p.annee && <span>{p.annee}</span>}
                    </span>
                    {p.accroche && <span className="pj-carte-accroche">{p.accroche}</span>}
                    <span className="pj-carte-pied">
                      {p.technos ? <Technos ids={p.technos} compact /> : <span className="pj-carte-infos">{p.langage}</span>}
                      <span className="pj-carte-cadre">{p.cadre}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="pj">
      {ariane}
      <h1>Projets</h1>
      <p className="pj-intro">
        Cliquez sur l'un des domaines ci-dessous pour découvrir les projets que j'y ai réalisés, avec des captures et
        des démos quand c'est possible.
      </p>

      <ul className="pj-volets">
        {VOLETS.map((v) => (
          <li key={v.id}>
            <button className="pj-volet" onClick={() => naviguer({ rubrique: 'projets', volet: v.id })}>
              <span className="pj-volet-icone">
                <v.Icone size={30} strokeWidth={1.6} aria-hidden />
              </span>
              <span className="pj-volet-texte">
                <strong>{v.titre}</strong>
                <span>{v.sousTitre}</span>
              </span>
              <ArrowRight className="pj-volet-fleche" size={22} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Vignette({ projet }: { projet: Projet }) {
  const base = import.meta.env.BASE_URL
  const v = projet.vignette
  return (
    <span className={`pj-vignette${v?.telephone ? ' pj-vignette-telephones' : ''}`}>
      {!projet.Page ? (
        <em>Bientôt</em>
      ) : v?.telephone ? (
        <>
          <span className="pj-vignette-flou" style={{ backgroundImage: `url(${base}${v.images[0]})` }} />
          {v.images.map((image) => (
            <img key={image} src={`${base}${image}`} alt="" loading="lazy" />
          ))}
        </>
      ) : v ? (
        <img src={`${base}${v.images[0]}`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
      ) : null}
      {projet.Page && <ArrowRight className="pj-carte-fleche" size={18} aria-hidden />}
    </span>
  )
}
