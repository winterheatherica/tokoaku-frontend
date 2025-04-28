'use client'

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import axios from 'axios'

interface UserData {
  username?: string
  name?: string
  phone?: string
}

export default function AccountEdit() {
  const [form, setForm] = useState<UserData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(true)
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setForm({
          username: res.data.username || '',
          name: res.data.name || '',
          phone: res.data.phone || '',
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const auth = getAuth(firebaseApp)
      const user = auth.currentUser
      if (!user) throw new Error('User tidak ditemukan')

      const token = await user.getIdToken(true)
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage('Data berhasil diperbarui')
    } catch {
      setMessage('Gagal memperbarui data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Memuat form...</p>

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Akun</h3>
      <div>
        <label>Username:</label>
        <input type="text" name="username" value={form.username || ''} onChange={handleChange} />
      </div>
      <div>
        <label>Nama:</label>
        <input type="text" name="name" value={form.name || ''} onChange={handleChange} />
      </div>
      <div>
        <label>No HP:</label>
        <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} />
      </div>
      <button type="submit" disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
      {message && <p>{message}</p>}
    </form>
  )
}
