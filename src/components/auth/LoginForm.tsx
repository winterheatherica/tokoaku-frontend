'use client'

import { useState } from 'react'
import axios from 'axios'
import InputField from '@/components/common/InputField'
import Button from '@/components/common/Button'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[Login] Submit triggered')
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        email,
        password,
      })

      const { customToken } = res.data
      console.log('[Login] Token:', customToken)

      const auth = getAuth(firebaseApp)
      await signInWithCustomToken(auth, customToken)

      router.push('/')
    } catch (err: any) {
      console.log('[Login] Error:', err)
      setError(err.response?.data?.message || 'Gagal login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

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

      {error && <p>{error}</p>}

      <Button text="Login" loading={loading} type="submit" />
    </form>
  )
}
