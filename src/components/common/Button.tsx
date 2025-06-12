import './Button.css'

type Props = {
  text: string
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

export default function Button({
  text,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="button"
    >
      {loading ? `${text}...` : text}
    </button>
  )
}
