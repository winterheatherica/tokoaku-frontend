'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import BankAccountSellerPage from './bank-account-seller'
import './page.css'

export default function BankPage() {
  const { role, loading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading && role) {
      setReady(true)
    }
  }, [loading, role])

  if (!ready) return <p>Memuat halaman...</p>

  if (role === 'Seller') return <BankAccountSellerPage />

  return <p>Role tidak dikenali atau tidak memiliki akses ke halaman Bank Account.</p>
}
