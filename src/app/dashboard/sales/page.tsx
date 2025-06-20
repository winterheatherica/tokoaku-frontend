'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import SalesAdminPage from './sales-admin'
import SalesSellerPage from './sales-seller'

export default function SalesPage() {
  const { role, loading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading && role) {
      setReady(true)
    }
  }, [loading, role])

  if (!ready) return <p>Memuat halaman...</p>

  if (role === 'Admin') return <SalesAdminPage />
  if (role === 'Seller') return <SalesSellerPage />

  return <p>Role tidak dikenali</p>
}
