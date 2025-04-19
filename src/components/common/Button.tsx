type Props = {
  text: string
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  color?: 'blue' | 'green' | 'red'
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
