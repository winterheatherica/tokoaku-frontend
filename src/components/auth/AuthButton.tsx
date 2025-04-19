'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/constants/roles'

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Customer]: 'Customer',
  [UserRole.Seller]: 'Seller',
  [UserRole.Admin]: 'Admin',
}

export default function AuthButton() {
  const { user, isLoggedIn, loading, logout, role } = useAuth()

  if (loading) {
    return <span>Loading...</span>
  }

  if (!isLoggedIn) {
    return (
      <div>
        <Link href="/auth/login">Login</Link>{' '}
        <Link href="/auth/register">Signup</Link>
      </div>
    )
  }

  return (
    <div>
      <span>
        Halo, {user?.email}
        {role !== null && ROLE_LABEL[role] && (
          <span> as {ROLE_LABEL[role]}</span>
        )}
      </span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
