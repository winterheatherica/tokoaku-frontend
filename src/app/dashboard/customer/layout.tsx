'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (role !== 'Customer') {
        router.replace('/login')
      } else {
        setOk(true)
      }
    }
  }, [loading, role, router])

  return ok ? (
    <div className="customer-layout">
      <Sidebar role="Customer" />
      <main>{children}</main>
    </div>
  ) : <p>Memuat halaman Customer...</p>
}
