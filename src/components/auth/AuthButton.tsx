'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function AuthButton() {
  const { user, isLoggedIn, loading, logout, role } = useAuth()

  if (loading) {
    return <span>Loading...</span>
  }

  if (!isLoggedIn) {
    return (
      <div>
        <Link href="/login">Login</Link>{' '}
        <Link href="/register">Signup</Link>
      </div>
    )
  }

  return (
    <div>
      <span>
        Halo, {user?.email}
        {role && (
          <span> as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
        )}
      </span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
