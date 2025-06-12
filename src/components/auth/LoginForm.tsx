'use client'

import { useState } from 'react'
import axios from 'axios'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import InputField from '@/components/common/InputField'
import Button from '@/components/common/Button'
import './LoginForm.css'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        email,
        password,
      })

      const { customToken } = res.data

      const auth = getAuth(firebaseApp)
      await signInWithCustomToken(auth, customToken)

      router.push('/')
    } catch (err: any) {
      console.error('[FRONTEND] Error saat login:', err)
      setError(err.response?.data?.message || 'Gagal login, cek koneksi atau data login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-semibold text-center">Login</h2>

      <InputField
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="email@example.com"
        label="Email"
      />

      <InputField
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="********"
        label="Password"
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <Button
        type="submit"
        text={loading ? 'Logging in...' : 'Login'}
        loading={loading}
      />
    </form>
  )
}
