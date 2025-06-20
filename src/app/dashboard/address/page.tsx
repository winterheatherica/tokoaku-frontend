'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import AddressCustomerPage from './address-customer'
import './page.css'

export default function AddressPage() {
  const { role, loading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading && role) {
      setReady(true)
    }
  }, [loading, role])

  if (!ready) return <p>Memuat halaman...</p>

  if (role === 'Customer') return <AddressCustomerPage />

  return <p>Role tidak dikenali atau tidak memiliki akses ke halaman Address.</p>
}
