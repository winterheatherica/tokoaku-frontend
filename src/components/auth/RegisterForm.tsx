'use client'

import { useState } from 'react'
import axios from 'axios'
import InputField from '@/components/common/InputField'
import Button from '@/components/common/Button'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Register] Submit triggered')
    setLoading(true)
    setError(null)
    setMessage('')

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        email,
        password,
      })

      console.log('[Register] Sukses:', res.data)
      setMessage('Registrasi berhasil, silakan cek email kamu!')
    } catch (err: any) {
      console.log('[Register] Error:', err)
      setError(err.response?.data?.message || 'Gagal register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Daftar Akun</h2>

      <InputField
        type="email"
        label="Email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        type="password"
        label="Password"
        placeholder="********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button text="Daftar" loading={loading} type="submit" />

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </form>
  )
}
