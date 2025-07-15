'use client'

import { useState } from 'react'
import axios from 'axios'
import InputField from '@/components/common/InputField'
import Button from '@/components/common/Button'
import './RegisterForm.css'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage('')

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        email,
        password,
      })

      setMessage('Registrasi berhasil, silakan cek email kamu!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2 className="register-form-title">Daftar Akun</h2>

      <div className="register-form-group">
        <InputField
          type="email"
          label="Email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="register-form-group">
        <InputField
          type="password"
          label="Password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="register-form-group">
        <Button text={loading ? 'Mendaftarkan...' : 'Daftar'} loading={loading} type="submit" />
      </div>

      {message && <p className="register-message">{message}</p>}
      {error && <p className="register-error">{error}</p>}

      <div className="register-form-links">
        <p>
          Sudah punya akun?{' '}
          <a href="/login" className="register-link">Login di sini</a>
        </p>
        <p>
          <a href="/" className="register-link">← Kembali ke beranda</a>
        </p>
      </div>
    </form>
  )
}
