'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AuthGuardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.replace('/auth/login')
      } else {
        setCanRender(true)
      }
    }
  }, [loading, isLoggedIn, router])

  if (!canRender) {
    return (
      <div>
        <span>Memuat halaman...</span>
      </div>
    )
  }

  return <>{children}</>
}
