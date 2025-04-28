'use client'

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import axios from 'axios'

interface UserData {
  id: string
  email: string
  username?: string
  name?: string
  phone?: string
  provider?: string
  role: string
  createdAt: string
}

export default function AccountView() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true)
          const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setUser(res.data)
        } catch {
          setError('Gagal mengambil data user')
        } finally {
          setLoading(false)
        }
      } else {
        setError('Kamu belum login')
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading) return <p>Memuat data...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h2>Akun Saya</h2>
      <ul>
        <li><strong>ID:</strong> {user?.id}</li>
        <li><strong>Email:</strong> {user?.email}</li>
        <li><strong>Username:</strong> {user?.username || '-'}</li>
        <li><strong>Nama:</strong> {user?.name || '-'}</li>
        <li><strong>No HP:</strong> {user?.phone || '-'}</li>
        <li><strong>Provider:</strong> {user?.provider || '-'}</li>
        <li><strong>Role:</strong> {user?.role}</li>
        <li>
          <strong>Dibuat pada:</strong>{' '}
          {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
        </li>
      </ul>
    </div>
  )
}
