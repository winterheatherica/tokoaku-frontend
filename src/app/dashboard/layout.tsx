'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import './layout.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!role || !['Admin', 'Seller', 'Customer'].includes(role)) {
        router.replace('/')
      } else {
        setOk(true)
      }
    }
  }, [loading, role, router])

    return ok && role ? (
      <div className="auth-layout">
        <div className="auth-sidebar">
            <Sidebar role={role} />
        </div>
        <main className="auth-main">{children}</main>
      </div>
    ) : (
      <p>Memuat halaman Auth...</p>
    )
}
