const SON = {
  chemins: [1, 2, 3, 4, 5, 6].map((n) => `/audio/key_${n}.mp3`),
  volume: 0.5,
  demiTons: 0,
  variationHauteur: 1.5,
  variationVolume: 0.25,
}

let contexte: AudioContext | null = null
let actifs = true
let chargement: Promise<void> | null = null
let derniere = -1
const frappes: AudioBuffer[] = []

const telechargements =
  typeof window !== 'undefined'
    ? SON.chemins.map((chemin) =>
        fetch(chemin).then((reponse) => {
          if (!reponse.ok) throw new Error(`${reponse.status} sur ${chemin}`)
          return reponse.arrayBuffer()
        }),
      )
    : []

function chargerFrappes(c: AudioContext) {
  chargement ??= Promise.allSettled(
    telechargements.map((telechargement) => telechargement.then((donnees) => c.decodeAudioData(donnees))),
  ).then((resultats) => {
    for (const resultat of resultats) {
      if (resultat.status === 'fulfilled') frappes.push(resultat.value)
      else console.warn('Son de frappe introuvable :', resultat.reason)
    }
  })
}

// Nombre au hasard entre -1 et 1
const hasard = () => Math.random() * 2 - 1

// Tire une frappe au hasard, différente de la précédente
function choisirFrappe(liste: AudioBuffer[]) {
  let index = Math.floor(Math.random() * liste.length)
  if (liste.length > 1 && index === derniere) index = (index + 1) % liste.length
  derniere = index
  return liste[index]
}

export function programmerFrappe(c: BaseAudioContext, sortie: AudioNode, liste: AudioBuffer[], quand: number) {
  const source = c.createBufferSource()
  source.buffer = choisirFrappe(liste)
  const demiTons = SON.demiTons + hasard() * SON.variationHauteur
  source.playbackRate.value = 2 ** (demiTons / 12)

  const volume = c.createGain()
  volume.gain.value = SON.volume * (1 + hasard() * SON.variationVolume)

  source.connect(volume).connect(sortie)
  source.start(quand)
}

export function debloquerSon() {
  if (!contexte && typeof window !== 'undefined' && 'AudioContext' in window) {
    contexte = new AudioContext()
  }
  if (!contexte) return
  void contexte.resume()
  chargerFrappes(contexte)
}

export function activerSons(valeur: boolean) {
  actifs = valeur
}

export function jouerTouche() {
  const c = contexte
  if (!actifs || !c || c.state !== 'running' || frappes.length === 0) return
  programmerFrappe(c, c.destination, frappes, c.currentTime)
}
