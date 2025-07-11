'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (role !== 'Seller') {
        router.replace('/')
      } else {
        setOk(true)
      }
    }
  }, [loading, role, router])

  return ok ? (
    <div className="seller-layout">
      <main>{children}</main>
    </div>
  ) : <p>Memuat halaman Seller...</p>
}
