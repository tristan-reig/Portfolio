import { siDart, siFlutter, siLua, siNumpy, siOpengl, siPython, siSupabase, type SimpleIcon } from 'simple-icons'

// Technologies citées dans les pages de projets avec leur logo.
type Techno = { nom: string } & ({ icone: SimpleIcon } | { image: string })

const TECHNOS = {
  lua: { nom: 'Lua', icone: siLua },
  glsl: { nom: 'GLSL', icone: siOpengl }, // le langage des shaders d'OpenGL
  love: { nom: 'LÖVE', image: 'logos/technos/love.svg' },
  dart: { nom: 'Dart', icone: siDart },
  flutter: { nom: 'Flutter', icone: siFlutter },
  supabase: { nom: 'Supabase', icone: siSupabase },
  python: { nom: 'Python', icone: siPython },
  numpy: { nom: 'NumPy', icone: siNumpy },
} satisfies Record<string, Techno>

export type TechnoId = keyof typeof TECHNOS

// Pastille pour chaque technologie
export function Technos({ ids, compact }: { ids: TechnoId[]; compact?: boolean }) {
  return (
    <ul className={`pr-technos${compact ? ' pr-technos-compact' : ''}`}>
      {ids.map((id) => {
        const t: Techno = TECHNOS[id]
        return (
          <li key={id} title={compact ? t.nom : undefined}>
            <span className="pr-techno-logo">
              {'icone' in t ? (
                <svg viewBox="0 0 24 24" fill={`#${t.icone.hex}`} aria-hidden="true">
                  <path d={t.icone.path} />
                </svg>
              ) : (
                <img src={`${import.meta.env.BASE_URL}${t.image}`} alt="" />
              )}
            </span>
            {!compact && t.nom}
          </li>
        )
      })}
    </ul>
  )
}
