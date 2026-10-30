import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import Curseur from './Curseur'
import { enregistrerBasculer, signalerLecture } from './etat'
import Paroles from './Paroles'
import Separateur from './Separateur'
import { chargerLecteur, chargerPlaylist, type LecteurYT, type Playlist } from './youtube'
import './Musique.css'

// Identifiant de ta playlist YouTube
const PLAYLIST_YOUTUBE = 'OLAK5uy_msYZvB4nIlIHiuHMxqrI71oIKbfHqoti4'
const CLE = import.meta.env.VITE_YOUTUBE_CLE as string | undefined

// Panneau des paroles, réglable avec la poignée qui le sépare de la file d'attente
const PAROLES = {
  hauteur: 210,
  replie: 44,
  seuil: 110,
  fileMin: 190,
}

type Boucle = 'non' | 'liste' | 'titre'
const BOUCLE_SUIVANTE: Record<Boucle, Boucle> = { non: 'liste', liste: 'titre', titre: 'non' }

const formatTemps = (secondes: number) => {
  const s = Math.floor(secondes)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Ordre aléatoire de la liste
function melanger(n: number, premier: number) {
  const reste = Array.from({ length: n }, (_, i) => i).filter((i) => i !== premier)
  for (let i = reste.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[reste[i], reste[j]] = [reste[j], reste[i]]
  }
  return [premier, ...reste]
}

export default function Musique() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [erreur, setErreur] = useState<string | null>(
    !CLE ? 'il manque la clé YouTube (VITE_YOUTUBE_CLE dans os/.env.local)' : !PLAYLIST_YOUTUBE ? "il manque l'identifiant de la playlist (PLAYLIST_YOUTUBE dans Musique.tsx)" : null,
  )
  const [index, setIndex] = useState(0)
  const [pret, setPret] = useState(false)
  const [enLecture, setEnLecture] = useState(false)
  const [temps, setTemps] = useState({ position: 0, duree: 0 })
  const [volume, setVolume] = useState(80)
  const volumeAvantMuet = useRef(80)
  const [boucle, setBoucle] = useState<Boucle>('liste')
  const [ordre, setOrdre] = useState<number[] | null>(null)
  const [hauteurParoles, setHauteurParoles] = useState(PAROLES.hauteur)
  const cote = useRef<HTMLElement>(null)

  const conteneur = useRef<HTMLDivElement>(null)
  const lecteur = useRef<LecteurYT | null>(null)
  const finRef = useRef<() => void>(() => {})
  const suivantRef = useRef<() => void>(() => {})
  const echecs = useRef(0)
  const nbVideos = useRef(0)

  useEffect(() => {
    if (!CLE || !PLAYLIST_YOUTUBE) return
    let annule = false
    chargerPlaylist(PLAYLIST_YOUTUBE, CLE)
      .then((p) => !annule && setPlaylist(p))
      .catch((e: Error) => !annule && setErreur(e.message))
    return () => {
      annule = true
    }
  }, [])

  const videos = playlist?.videos ?? []
  const video = videos[index]
  const premiere = videos[0]?.id

  useEffect(() => {
    const parent = conteneur.current
    if (!parent || !premiere) return
    let annule = false
    const element = document.createElement('div')
    parent.appendChild(element)

    chargerLecteur().then((YT) => {
      if (annule) return
      lecteur.current = new YT.Player(element, {
        width: '100%',
        height: '100%',
        videoId: premiere,
        playerVars: {
          controls: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => setPret(true),
          onStateChange: ({ data }) => {
            const joue = data === YT.PlayerState.PLAYING || data === YT.PlayerState.BUFFERING
            setEnLecture(joue)
            signalerLecture(joue)
            if (data === YT.PlayerState.PLAYING) echecs.current = 0
            if (data === YT.PlayerState.ENDED) finRef.current()
          },
          onError: () => {
            echecs.current += 1
            if (echecs.current < nbVideos.current) suivantRef.current()
            else setErreur('aucune vidéo de cette playlist ne peut être lue ici')
          },
        },
      })
    })

    return () => {
      annule = true
      lecteur.current?.destroy()
      lecteur.current = null
      parent.replaceChildren()
      signalerLecture(false)
    }
  }, [premiere])

  useEffect(() => {
    if (!enLecture) return
    const minuteur = setInterval(() => {
      const l = lecteur.current
      if (l) setTemps({ position: l.getCurrentTime(), duree: l.getDuration() })
    }, 250)
    return () => clearInterval(minuteur)
  }, [enLecture])

  useEffect(() => {
    if (pret) lecteur.current?.setVolume(volume)
  }, [pret, volume])

  const jouer = (i: number) => {
    const v = videos[i]
    if (!v || !lecteur.current) return
    setIndex(i)
    setTemps({ position: 0, duree: v.duree })
    lecteur.current.loadVideoById(v.id)
  }

  const voisin = (pas: number) => {
    const liste = ordre ?? videos.map((_, i) => i)
    const n = liste.indexOf(index) + pas
    if (n >= 0 && n < liste.length) return liste[n]
    if (boucle === 'non' && pas > 0) return null
    return liste[(n + liste.length) % liste.length]
  }

  const suivant = () => {
    const i = voisin(1)
    if (i !== null) jouer(i)
  }

  useEffect(() => {
    suivantRef.current = () => jouer(voisin(1) ?? (index + 1) % videos.length)
    finRef.current = () => {
      if (boucle === 'titre') {
        lecteur.current?.seekTo(0, true)
        lecteur.current?.playVideo()
        return
      }
      const i = voisin(1)
      if (i !== null) jouer(i)
    }
    nbVideos.current = videos.length
  })

  const precedent = () => {
    if (temps.position > 3) {
      lecteur.current?.seekTo(0, true)
      setTemps({ position: 0, duree: temps.duree })
    } else jouer(voisin(-1) ?? index)
  }

  const basculer = () => {
    if (!lecteur.current) return
    if (enLecture) lecteur.current.pauseVideo()
    else lecteur.current.playVideo()
  }

  useEffect(() => {
    enregistrerBasculer(basculer)
    return () => enregistrerBasculer(null)
  })

  const basculerAleatoire = () => setOrdre(ordre ? null : melanger(videos.length, index))

  const basculerMuet = () => {
    if (volume > 0) {
      volumeAvantMuet.current = volume
      setVolume(0)
    } else setVolume(volumeAvantMuet.current || 50)
  }

  if (erreur) return <p className="musique-message">Impossible de charger la musique : {erreur}</p>
  if (!playlist) return <p className="musique-message">Chargement…</p>
  if (!video) return <p className="musique-message">Aucune vidéo à lire dans cette playlist.</p>

  const duree = temps.duree || video.duree
  const parolesRepliees = hauteurParoles < PAROLES.seuil
  const aSuivre = voisin(1)

  return (
    <div className="musique-cadre">
      <div className="musique-ambiance" style={{ backgroundImage: `url(${video.pochette})` }} />
      <div className="musique-video-cachee" ref={conteneur} />

      <div className="musique">
        <section className="musique-lecteur">
          <div className="musique-pochette-cadre" style={{ '--pochette': `url(${video.pochette})` } as React.CSSProperties}>
            <img className="musique-pochette" src={video.pochette} alt="" />
          </div>

          <div className="musique-infos">
            <h1>{video.titre}</h1>
            <p className="musique-doux">{video.chaine}</p>
          </div>

          <div>
            <Curseur
              className="musique-progression"
              valeur={temps.position}
              max={duree}
              pas={5}
              label="Position"
              texte={`${formatTemps(temps.position)} sur ${formatTemps(duree)}`}
              onFin={(position) => {
                lecteur.current?.seekTo(position, true)
                setTemps({ position, duree })
              }}
            />
            <div className="musique-temps">
              <span>{formatTemps(temps.position)}</span>
              <span>{formatTemps(duree)}</span>
            </div>
          </div>

          <div className="musique-reglages">
            <div className="musique-commandes">
              <button
                className={`musique-bouton musique-option${ordre ? ' musique-option-active' : ''}`}
                onClick={basculerAleatoire}
                aria-pressed={!!ordre}
                title="Lecture aléatoire"
                aria-label="Lecture aléatoire"
              >
                <Shuffle {...trait} />
              </button>
              <button className="musique-bouton" onClick={precedent} disabled={!pret} aria-label="Précédent"><SkipBack {...plein} /></button>
              <button className="musique-bouton musique-bouton-principal" onClick={basculer} disabled={!pret} aria-label={enLecture ? 'Pause' : 'Lecture'}>
                {enLecture ? <Pause {...plein} /> : <Play {...plein} />}
              </button>
              <button className="musique-bouton" onClick={suivant} disabled={!pret || aSuivre === null} aria-label="Suivant"><SkipForward {...plein} /></button>
              <button
                className={`musique-bouton musique-option${boucle !== 'non' ? ' musique-option-active' : ''}`}
                onClick={() => setBoucle(BOUCLE_SUIVANTE[boucle])}
                title={boucle === 'non' ? 'Répéter' : boucle === 'liste' ? 'Répéter le titre' : 'Ne plus répéter'}
                aria-label={boucle === 'non' ? 'Répétition désactivée' : boucle === 'liste' ? 'Répéter la liste' : 'Répéter le titre'}
              >
                {boucle === 'titre' ? <Repeat1 {...trait} /> : <Repeat {...trait} />}
              </button>
            </div>

            <div className="musique-volume">
              <button className="musique-bouton musique-option" onClick={basculerMuet} aria-label={volume > 0 ? 'Couper le son' : 'Remettre le son'}>
                <IconeVolume niveau={volume} />
              </button>
              <Curseur className="musique-volume-curseur" valeur={volume} max={100} pas={5} label="Volume" texte={`${Math.round(volume)} %`} onChange={(v) => setVolume(Math.round(v))} />
              <span className="musique-volume-valeur">{Math.round(volume)}</span>
            </div>
          </div>
        </section>

        <section className="musique-cote" ref={cote}>
          <div
            className={`musique-bloc musique-bloc-paroles${parolesRepliees ? ' musique-bloc-replie' : ''}`}
            style={{ flexBasis: parolesRepliees ? PAROLES.replie : hauteurParoles }}
          >
            <header className="musique-bloc-entete">
              <h2>Paroles</h2>
              <span className="musique-doux">via LRCLIB</span>
            </header>
            {!parolesRepliees && (
                <Paroles
                  id={video.id}
                  titre={video.titre}
                  artiste={video.chaine}
                  duree={video.duree}
                  position={temps.position}
                  onChercher={(position) => {
                    lecteur.current?.seekTo(position, true)
                    lecteur.current?.playVideo()
                    setTemps({ position, duree })
                  }}
                />
            )}
          </div>

          <Separateur
            hauteur={hauteurParoles}
            min={PAROLES.replie}
            max={() => (cote.current?.clientHeight ?? 600) - PAROLES.fileMin - 16}
            onChange={setHauteurParoles}
            label="Taille du panneau des paroles"
          />

          <div className="musique-bloc musique-liste">
            <header className="musique-bloc-entete">
              <h2>File d'attente</h2>
              <span className="musique-doux">
                {playlist.titre} · {videos.length} titres
                {aSuivre !== null && aSuivre !== index && <> · à suivre : {videos[aSuivre].titre}</>}
              </span>
            </header>
            <ol>
              {videos.map((v, i) => (
                <li key={`${v.id}-${i}`}>
                  <button className={`musique-morceau${i === index ? ' musique-morceau-actif' : ''}`} onClick={() => jouer(i)} disabled={!pret}>
                    <span className="musique-numero">{i === index && enLecture ? <Egaliseur /> : i + 1}</span>
                    <img className="musique-miniature" src={v.miniature} alt="" loading="lazy" />
                    <span className="musique-morceau-texte">
                      <span className="musique-morceau-titre">{v.titre}</span>
                      <span className="musique-doux">{v.chaine}</span>
                    </span>
                    <span className="musique-doux">{formatTemps(v.duree)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

        </section>
      </div>
    </div>
  )
}

function Egaliseur() {
  return (
    <span className="musique-egaliseur" aria-label="En lecture">
      <span /><span /><span />
    </span>
  )
}

const trait = { size: 18, 'aria-hidden': true } as const
const plein = { ...trait, fill: 'currentColor' } as const

function IconeVolume({ niveau }: { niveau: number }) {
  const Icone = niveau === 0 ? VolumeX : niveau <= 33 ? Volume : niveau <= 66 ? Volume1 : Volume2
  return <Icone {...trait} />
}
