import { siLua, siOpengl, type SimpleIcon } from 'simple-icons'

// Technologies citées dans les pages de projets, avec leur logo.
type Techno = { nom: string } & ({ icone: SimpleIcon } | { image: string })

const TECHNOS = {
  lua: { nom: 'Lua', icone: siLua },
  glsl: { nom: 'GLSL', icone: siOpengl },
  love: { nom: 'LÖVE', image: 'logos/technos/love.svg' },
} satisfies Record<string, Techno>

export type TechnoId = keyof typeof TECHNOS

// Pastille pour technologie
export function Technos({ ids }: { ids: TechnoId[] }) {
  return (
    <ul className="pr-technos">
      {ids.map((id) => {
        const t: Techno = TECHNOS[id]
        return (
          <li key={id}>
            <span className="pr-techno-logo">
              {'icone' in t ? (
                <svg viewBox="0 0 24 24" fill={`#${t.icone.hex}`} aria-hidden="true">
                  <path d={t.icone.path} />
                </svg>
              ) : (
                <img src={`${import.meta.env.BASE_URL}${t.image}`} alt="" />
              )}
            </span>
            {t.nom}
          </li>
        )
      })}
    </ul>
  )
}
