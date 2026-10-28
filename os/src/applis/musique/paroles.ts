// Paroles depuis LRCLIB (lrclib.net) : base libre et gratuite, sans clé, avec des paroles synchronisées.
// Les titres YouTube sont souvent bruités (« Artiste - Titre (Official Video) ») : on les nettoie,
// puis on garde le résultat dont la durée colle le mieux à celle de la vidéo.

export type Ligne = { temps: number; texte: string } // temps en secondes

export type Paroles =
  | { type: 'synchronisees'; lignes: Ligne[] }
  | { type: 'simples'; lignes: string[] }
  | { type: 'instrumental' }
  | { type: 'introuvables' }

type ResultatLrclib = {
  duration: number
  instrumental: boolean
  plainLyrics: string | null
  syncedLyrics: string | null
}

const API = 'https://lrclib.net/api/search'
const ECART_MAX = 4 // secondes d'écart tolérées entre la vidéo et le morceau trouvé

// « Tame Impala - End Of Summer (Official Video) » → « End Of Summer »
function nettoyer(titre: string, artiste: string) {
  let t = titre
    .replace(/[([][^)\]]*(official|video|vidéo|audio|lyrics?|clip|visuali[sz]er|hd|4k|remaster)[^)\]]*[)\]]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  // « Artiste - Titre » : on retire l'artiste devant
  const tiret = t.indexOf(' - ')
  if (tiret > 0 && t.slice(0, tiret).toLowerCase().includes(artiste.toLowerCase().split(' ')[0])) t = t.slice(tiret + 3)
  return t
}

// « [01:23.45] texte » → { temps: 83.45, texte }
function lireLrc(lrc: string): Ligne[] {
  const lignes: Ligne[] = []
  for (const brute of lrc.split('\n')) {
    const m = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/.exec(brute.trim())
    if (m) lignes.push({ temps: Number(m[1]) * 60 + Number(m[2]), texte: m[3] })
  }
  return lignes
}

async function chercher(parametres: Record<string, string>) {
  const r = await fetch(`${API}?${new URLSearchParams(parametres)}`)
  if (!r.ok) throw new Error(`LRCLIB : erreur ${r.status}`)
  return (await r.json()) as ResultatLrclib[]
}

const cache = new Map<string, Promise<Paroles>>()

export function chargerParoles(id: string, titre: string, artiste: string, duree: number) {
  let p = cache.get(id)
  if (!p) {
    p = trouver(titre, artiste, duree)
    // En cas d'échec réseau, on pourra réessayer plus tard
    p.catch(() => cache.delete(id))
    cache.set(id, p)
  }
  return p
}

async function trouver(titre: string, artiste: string, duree: number): Promise<Paroles> {
  const propre = nettoyer(titre, artiste)
  let resultats = await chercher({ track_name: propre, artist_name: artiste })
  if (resultats.length === 0) resultats = await chercher({ q: `${artiste} ${propre}` })

  // Le plus proche en durée, en préférant les paroles synchronisées
  const proches = resultats
    .filter((r) => !duree || Math.abs(r.duration - duree) <= ECART_MAX)
    .sort((a, b) => Number(!!b.syncedLyrics) - Number(!!a.syncedLyrics) || Math.abs(a.duration - duree) - Math.abs(b.duration - duree))
  const meilleur = proches[0]

  if (!meilleur) return { type: 'introuvables' }
  if (meilleur.instrumental) return { type: 'instrumental' }
  if (meilleur.syncedLyrics) return { type: 'synchronisees', lignes: lireLrc(meilleur.syncedLyrics) }
  if (meilleur.plainLyrics) return { type: 'simples', lignes: meilleur.plainLyrics.split('\n') }
  return { type: 'introuvables' }
}
