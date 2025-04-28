'use client'

import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { getAuth } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'

interface User {
  id: string
  email: string
  username?: string
  name?: string
  phone?: string
  password_hash?: string
  provider?: {
    id: number
    name: string
    created_at: string
  }
  created_at: string
  role: {
    id: number
    name: string
    created_at: string
  }
}


export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchUsers = async () => {
      try {
        const auth = getAuth(firebaseApp)
        const user = auth.currentUser

        if (!user) {
          setError('Kamu belum login')
          return
        }

        const token = await user.getIdToken(true)

        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('📦 Data user dari backend:', res.data)
        setUsers(res.data)
      } catch (err) {
        console.error('[AdminUsersPage] Gagal fetch users:', err)
        setError('Gagal memuat data user')
      }
    }

    fetchUsers()
  }, [])

  return (
    <div>
      <h1>10 User Terbaru</h1>
      {error && <p>{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name || user.username || user.email}</strong> – {user.role.name}
            <small>
              {user.created_at
                ? new Date(user.created_at).toLocaleString()
                : 'Tanggal tidak diketahui'}
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}
