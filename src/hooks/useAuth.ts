'use client'

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'

type Role = 'Admin' | 'Seller' | 'Customer'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getAuth(firebaseApp)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true)
          const firebaseRole = tokenResult.claims.role

          if (firebaseRole === 'Admin' || firebaseRole === 'Seller' || firebaseRole === 'Customer') {
            setRole(firebaseRole)
          } else {
            console.warn('[useAuth] Role tidak dikenali:', firebaseRole)
            setRole(null)
          }
        } catch (err) {
          console.error('[useAuth] Gagal ambil token claims:', err)
          setRole(null)
        }
      } else {
        setUser(null)
        setRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setRole(null)
    router.push('/login')
  }

  return {
    user,
    role,
    isLoggedIn: !!user,
    loading,
    logout,
  }
}
