'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
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
  }, [isLoggedIn, loading, router])

  if (!canRender) {
    return (
      <div>
        <span>Memuat halaman...</span>
      </div>
    )
  }

  return <>{children}</>
}
