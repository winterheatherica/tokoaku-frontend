'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.replace('/')
      } else {
        setReady(true)
      }
    }
  }, [isLoggedIn, loading, router])

  if (!ready || loading) return <p>Memuat halaman Visitor...</p>

  return <>{children}</>
}
