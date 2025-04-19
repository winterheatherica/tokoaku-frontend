'use client'

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/constants/roles'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getAuth(firebaseApp)

  const parseRole = (firebaseRole: any): UserRole | null =>
    typeof firebaseRole === 'number' && firebaseRole in UserRole
      ? firebaseRole as UserRole
      : null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(false)
          setRole(parseRole(tokenResult.claims.role))
        } catch (err) {
          console.log('[useAuth] Gagal ambil token claims:', err)
          setRole(null)
        }
      } else {
        console.log('[useAuth] Tidak ada user login')
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
    router.push('/auth/login')
  }

  return {
    user,
    role,
    isLoggedIn: !!user,
    loading,
    logout,
  }
}
