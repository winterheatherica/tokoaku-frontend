'use client'

type Props = {
  type: 'email' | 'password'
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  label?: string
}

export default function InputField({ type, value, onChange, placeholder, label }: Props) {
  return (
    <div>
      {label && <label className="block mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="input"
      />
    </div>
  )
}
