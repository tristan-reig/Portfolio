// YouTube : la liste des vidéos vient de la YouTube Data API v3,
// la lecture du lecteur officiel (IFrame Player API), piloté par nos propres boutons.
// Règles de YouTube : le lecteur doit rester visible (200 × 200 px minimum), rien ne doit le recouvrir.

export type Video = {
  id: string
  titre: string
  chaine: string
  miniature: string
  pochette: string
  duree: number
}

export type Playlist = {
  titre: string
  lien: string
  videos: Video[]
}

const API = 'https://www.googleapis.com/youtube/v3'
const MAX_VIDEOS = 200

type ElementPlaylist = {
  snippet: {
    title: string
    videoOwnerChannelTitle?: string
    resourceId: { videoId: string }
    thumbnails?: { maxres?: { url: string }; medium?: { url: string }; default?: { url: string } }
  }
  status?: { privacyStatus: string }
}

type ReponseApi<T> = { items?: T[]; nextPageToken?: string; error?: { message: string } }

async function appeler<T>(chemin: string, parametres: Record<string, string>, cle: string) {
  const url = `${API}/${chemin}?${new URLSearchParams({ ...parametres, key: cle })}`
  const r = (await (await fetch(url)).json()) as ReponseApi<T>
  if (r.error) throw new Error(r.error.message)
  return r
}

// « PT3M33S » → 213 secondes
function lireDuree(iso: string) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso)
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0
}

export async function chargerPlaylist(id: string, cle: string): Promise<Playlist> {
  const [infos] = (await appeler<{ snippet: { title: string } }>('playlists', { part: 'snippet', id }, cle)).items ?? []
  if (!infos) throw new Error('playlist introuvable (elle doit être publique ou non répertoriée)')

  // Les vidéos, 50 par page
  const elements: ElementPlaylist[] = []
  let page: string | undefined
  do {
    const r = await appeler<ElementPlaylist>(
      'playlistItems',
      { part: 'snippet,status', playlistId: id, maxResults: '50', ...(page ? { pageToken: page } : {}) },
      cle,
    )
    elements.push(...(r.items ?? []))
    page = r.nextPageToken
  } while (page && elements.length < MAX_VIDEOS)

  // Les vidéos privées ou supprimées ne peuvent pas être lues
  const lisibles = elements.filter((e) => e.status?.privacyStatus !== 'private' && e.snippet.thumbnails)

  // Les durées sont dans une autre partie de l'API, 50 vidéos par appel
  const durees = new Map<string, number>()
  for (let i = 0; i < lisibles.length; i += 50) {
    const ids = lisibles.slice(i, i + 50).map((e) => e.snippet.resourceId.videoId)
    const r = await appeler<{ id: string; contentDetails: { duration: string } }>(
      'videos',
      { part: 'contentDetails', id: ids.join(',') },
      cle,
    )
    r.items?.forEach((v) => durees.set(v.id, lireDuree(v.contentDetails.duration)))
  }

  return {
    titre: infos.snippet.title,
    lien: `https://www.youtube.com/playlist?list=${id}`,
    videos: lisibles.map((e) => ({
      id: e.snippet.resourceId.videoId,
      titre: e.snippet.title,
      // Les chaînes automatiques de YouTube Music s'appellent « Artiste - Topic »
      chaine: (e.snippet.videoOwnerChannelTitle ?? '').replace(/ - Topic$/, ''),
      miniature: e.snippet.thumbnails?.medium?.url ?? e.snippet.thumbnails?.default?.url ?? '',
      pochette: e.snippet.thumbnails?.maxres?.url ?? e.snippet.thumbnails?.medium?.url ?? '',
      duree: durees.get(e.snippet.resourceId.videoId) ?? 0,
    })),
  }
}

// ——— Lecteur ———

export type LecteurYT = {
  loadVideoById(id: string): void
  cueVideoById(id: string): void
  playVideo(): void
  pauseVideo(): void
  seekTo(secondes: number, autoriserChargement: boolean): void
  getCurrentTime(): number
  getDuration(): number
  setVolume(volume: number): void
  destroy(): void
}

type OptionsLecteur = {
  width: string
  height: string
  videoId: string
  playerVars: Record<string, number>
  events: {
    onReady: () => void
    onStateChange: (e: { data: number }) => void
    onError?: (e: { data: number }) => void
  }
}

type APIYouTube = {
  Player: new (element: HTMLElement, options: OptionsLecteur) => LecteurYT
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number, BUFFERING: number }
}

declare global {
  interface Window {
    YT?: APIYouTube
    onYouTubeIframeAPIReady?: () => void
  }
}

let chargement: Promise<APIYouTube> | null = null

// Charge l'API du lecteur une seule fois pour toute la page
export function chargerLecteur() {
  chargement ??= new Promise<APIYouTube>((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!)
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return chargement
}
