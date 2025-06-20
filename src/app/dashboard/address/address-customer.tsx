'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import './page.css'

interface Address {
  id: string
  address_line: string
  city: string
  province: string
  postal_code: string
  is_active: boolean
  latitude: number
  longitude: number
}

export default function AddressCustomer() {
  const { user, loading } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [selectedActiveId, setSelectedActiveId] = useState<string | null>(null)

  const fetchAddresses = async () => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/address/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal mengambil alamat')

      setAddresses(data.addresses)
      const activeAddr = data.addresses.find((a: Address) => a.is_active)
      setSelectedActiveId(activeAddr?.id || null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [user])

  const handleSetActive = async () => {
    if (!user || !selectedActiveId) return
    try {
      const token = await user.getIdToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/address/set-active/${selectedActiveId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        let message = 'Gagal mengatur alamat aktif'
        try {
          const contentType = res.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const errData = await res.json()
            message = errData.message || message
          } else {
            const errText = await res.text()
            if (errText) message = errText
          }
        } catch (e) {
          message = 'Terjadi kesalahan tak terduga'
        }
        throw new Error(message)
      }

      setEditMode(false)
      fetchAddresses()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="addressWrapper">
      <h2>Alamat Saya</h2>
      <div className="addressHeaderAction">
        <Link href="/dashboard/address/new">
          <button className="Button">Tambah Alamat Baru</button>
        </Link>
        {addresses.length > 0 && (
          <button className="Button" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Batal' : 'Edit Alamat Aktif'}
          </button>
        )}
      </div>

      {loading || fetching ? <p>Memuat data alamat...</p> : null}
      {error && <p className="errorText">{error}</p>}

      {addresses.length > 0 ? (
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSetActive()
        }}>
          <ul className="addressList">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className={`addressItem ${addr.is_active ? 'active' : ''}`}
              >
                <strong>{addr.address_line}</strong><br />
                {addr.city}, {addr.province}, {addr.postal_code}<br />
                <small>Koordinat: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}</small><br />
                {editMode ? (
                  <label className="radioSet">
                    <input
                      type="radio"
                      name="activeAddress"
                      value={addr.id}
                      checked={selectedActiveId === addr.id}
                      onChange={() => setSelectedActiveId(addr.id)}
                    />
                    Jadikan alamat utama
                  </label>
                ) : (
                  addr.is_active && <span className="activeLabel">Alamat Utama</span>
                )}
              </li>
            ))}
          </ul>

          {editMode && (
            <button type="submit" className="Button submitBtn">
              Simpan Perubahan
            </button>
          )}
        </form>
      ) : (!fetching && !error) && (
        <p>Belum ada alamat tersimpan.</p>
      )}
    </div>
  )
}
