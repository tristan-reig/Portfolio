import { useEffect, useState } from 'react'

const FORMAT = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function useHorloge() {
  const [maintenant, setMaintenant] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setMaintenant(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return FORMAT.format(maintenant)
}
