'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Script from 'next/script'
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
    <>
      {/* ✅ Google Maps hanya dimuat sekali */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="beforeInteractive"
      />

      <div className="auth-layout">
        <div className="auth-sidebar">
          <Sidebar role={role} />
        </div>
        <main className="auth-main">{children}</main>
      </div>
    </>
  ) : (
    <p>Memuat halaman Auth...</p>
  )
}
