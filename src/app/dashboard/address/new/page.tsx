'use client'

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import '../page.css'

declare global {
  interface Window {
    google: typeof google
  }
}

export default function NewAddressPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    address_line: '',
    city: '',
    province: '',
    postal_code: '',
    is_active: true
  })

  const [coords, setCoords] = useState({ lat: 0, lng: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google || document.getElementById('google-maps-script')) {
        initMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script'
      script.onload = initMap
      document.body.appendChild(script)
    }

    const initMap = () => {
      if (!window.google || !mapRef.current) return

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -6.2, lng: 106.8 },
        zoom: 11
      })

      const marker = new window.google.maps.Marker({
        position: { lat: -6.2, lng: 106.8 },
        map
      })

      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat() ?? 0
        const lng = e.latLng?.lng() ?? 0
        setCoords({ lat, lng })
        marker.setPosition(new window.google.maps.LatLng(lat, lng))
      })
    }

    loadGoogleMaps()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    const val = type === 'checkbox' ? target.checked : value

    setForm(prev => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('User belum login')
      return
    }

    const token = await user.getIdToken()

    const payload = {
      ...form,
      latitude: coords.lat,
      longitude: coords.lng
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/address/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal menambahkan alamat')

      toast.success("Alamat berhasil ditambahkan!")
      router.push('/dashboard/address')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="addressWrapper">
      <h2>Tambah Alamat Baru</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Alamat Lengkap</label>
          <textarea name="address_line" value={form.address_line} onChange={handleChange} rows={2} required />
        </div>
        <div>
          <label>Kota</label>
          <input type="text" name="city" value={form.city} onChange={handleChange} required />
        </div>
        <div>
          <label>Provinsi</label>
          <input type="text" name="province" value={form.province} onChange={handleChange} required />
        </div>
        <div>
          <label>Kode Pos</label>
          <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} required />
        </div>
        <div>
          <label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            &nbsp;Jadikan sebagai alamat utama
          </label>
        </div>
        <div className="mapContainer" ref={mapRef} />
        <button type="submit">Simpan Alamat</button>
      </form>
    </div>
  )
}
