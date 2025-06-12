'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (role !== 'Admin') {
        router.replace('/')
      } else {
        setOk(true)
      }
    }
  }, [loading, role, router])

  return ok ? (
    <div className="admin-layout">
      <Sidebar role="Admin" />
      <main>{children}</main>
    </div>
  ) : <p>Memuat halaman Admin...</p>
}
