import './BoutonRetour.css'

type Props = {
  onClick: () => void
}

export default function BoutonRetour({ onClick }: Props) {
  return (
    <button className="retour" onClick={onClick}>
      Retour
    </button>
  )
}
