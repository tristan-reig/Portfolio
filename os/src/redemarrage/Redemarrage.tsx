import { useEffect, useState, type ReactNode } from 'react'
import { finirRedemarrage } from './etat'
import './Redemarrage.css'

type Props = {
  onEteindre: () => void
  onAllumer: () => void
}

type Etape = 'fondu' | 'arret' | 'noir' | 'bios' | 'noyau' | 'systemd' | 'hyprland'

const OK = <span className="rd-ok">  OK  </span>

// Arrêt du système, comme systemd l'affiche
const ARRET: ReactNode[] = [
  <>[{OK}] Stopped target Graphical Interface.</>,
  <>[{OK}] Stopped Hyprland session.</>,
  <>[{OK}] Stopped PipeWire Multimedia Service.</>,
  <>[{OK}] Stopped User Manager for UID 1000.</>,
  <>[{OK}] Stopped target Network.</>,
  <>[{OK}] Unmounted /home.</>,
  <>[{OK}] Reached target System Reboot.</>,
  <>[   42.071337] reboot: Restarting system</>,
]

const DEMARRAGE: ReactNode[] = [
  <>
    Welcome to <span className="rd-arch">Arch Linux</span>!
  </>,
  '',
  <>[{OK}] Created slice Slice /system/getty.</>,
  <>[{OK}] Reached target Local Encrypted Volumes.</>,
  <>[{OK}] Reached target Path Units.</>,
  <>[{OK}] Listening on Journal Socket.</>,
  <>         Mounting Temporary Directory /tmp...</>,
  <>[{OK}] Mounted Temporary Directory /tmp.</>,
  <>[{OK}] Started Journal Service.</>,
  <>[{OK}] Finished Load Kernel Modules.</>,
  <>         Starting Rule-based Manager for Device Events and Files...</>,
  <>[{OK}] Started Rule-based Manager for Device Events and Files.</>,
  <>[{OK}] Reached target Local File Systems.</>,
  <>[{OK}] Started Network Configuration.</>,
  <>[{OK}] Reached target Network.</>,
  <>[{OK}] Started Bluetooth service.</>,
  <>[{OK}] Started PipeWire Multimedia Service.</>,
  <>[{OK}] Started D-Bus User Message Bus.</>,
  <>[{OK}] Reached target Multi-User System.</>,
  <>         Starting Hyprland...</>,
  <>[{OK}] Started Hyprland.</>,
  <>[{OK}] Reached target Graphical Interface.</>,
]

const MEMOIRE = 16384

export default function Redemarrage({ onEteindre, onAllumer }: Props) {
  const [etape, setEtape] = useState<Etape>('fondu')
  const [lignes, setLignes] = useState<ReactNode[]>([])
  const [memoire, setMemoire] = useState(0)
  const [bios, setBios] = useState(0)
  const [fin, setFin] = useState(false)

  useEffect(() => {
    let annule = false
    const minuteurs: number[] = []
    const attendre = (ms: number) =>
      new Promise<void>((ok) => minuteurs.push(window.setTimeout(ok, ms)))

    const jouer = async () => {
      // Le bureau s'assombrit, puis les messages d'arrêt défilent
      await attendre(600)
      if (annule) return
      onEteindre()
      setEtape('arret')
      for (const ligne of ARRET) {
        setLignes((l) => [...l, ligne])
        await attendre(130)
        if (annule) return
      }
      await attendre(500)
      if (annule) return

      // Écran noir, l'ordinateur redémarre
      setEtape('noir')
      setLignes([])
      await attendre(700)
      if (annule) return

      // BIOS
      setEtape('bios')
      for (let i = 1; i <= 4; i++) {
        setBios(i)
        await attendre(i === 4 ? 100 : 180)
        if (annule) return
      }
      for (let k = 1; k <= 30; k++) {
        setMemoire(Math.round((MEMOIRE * k) / 30))
        await attendre(30)
        if (annule) return
      }
      for (let i = 5; i <= 8; i++) {
        await attendre(260)
        if (annule) return
        setBios(i)
      }
      await attendre(700)
      if (annule) return

      // Chargement du noyau
      setEtape('noyau')
      setLignes(['Loading Linux linux ...'])
      await attendre(450)
      if (annule) return
      setLignes((l) => [...l, 'Loading initial ramdisk ...'])
      await attendre(600)
      if (annule) return

      // Services de systemd, à un rythme irrégulier comme pour de vrai
      setEtape('systemd')
      setLignes([])
      for (const ligne of DEMARRAGE) {
        setLignes((l) => [...l, ligne])
        await attendre(40 + Math.random() * 110)
        if (annule) return
      }
      await attendre(500)
      if (annule) return

      // 6. Hyprland : le bureau démarre sur l'écran de verrouillage, l'écran noir s'efface
      setEtape('hyprland')
      onAllumer()
      await attendre(150)
      if (annule) return
      setFin(true)
      await attendre(800)
      if (annule) return
      finirRedemarrage()
    }
    jouer()

    return () => {
      annule = true
      minuteurs.forEach(clearTimeout)
    }
  }, [onEteindre, onAllumer])

  return (
    <div className={`rd rd-${etape}${fin ? ' rd-fin' : ''}`} aria-live="polite" aria-label="Redémarrage">
      {(etape === 'arret' || etape === 'noyau' || etape === 'systemd') && (
        <pre className="rd-console">
          {lignes.map((l, i) => (
            <div key={i}>{l || ' '}</div>
          ))}
        </pre>
      )}

      {etape === 'bios' && (
        <pre className="rd-console rd-bios">
          {bios >= 1 && <div className="rd-bios-titre">TR-BIOS (C) 2026 Tristan Reig</div>}
          {bios >= 2 && <div>Version 1.0.4 - Portfolio Edition</div>}
          {bios >= 3 && <div>&nbsp;</div>}
          {bios >= 3 && <div>CPU : Virtual Octa-Core Processor @ 4.20 GHz</div>}
          {bios >= 4 && (
            <div>
              Memory Test : {memoire}M {memoire === MEMOIRE && 'OK'}
            </div>
          )}
          {bios >= 5 && <div>&nbsp;</div>}
          {bios >= 5 && <div>Detecting NVMe SSD ...... 1 TB</div>}
          {bios >= 6 && <div>Detecting USB Devices ... 2 found</div>}
          {bios >= 7 && <div>Detecting GPU ........... OK</div>}
          {bios >= 8 && <div className="rd-bios-bas">Press DEL to enter SETUP, F12 for Boot Menu</div>}
        </pre>
      )}

    </div>
  )
}
