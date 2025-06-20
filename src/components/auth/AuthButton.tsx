'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import './AuthButton.css'

export default function AuthButton() {
  const { user, isLoggedIn, loading, logout, role } = useAuth()

  if (loading) {
    return <span>Loading...</span>
  }

  if (!isLoggedIn) {
    return (
      <div className="auth-button-container">
        <Link href="/login" className="auth-button-link">Login</Link>
        <Link href="/register" className="auth-button-link">Signup</Link>
      </div>
    )
  }

  return (
    <div className="auth-button-container">
      <a href="/dashboard/home" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="auth-button-user" style={{ cursor: 'pointer' }}>
          Halo, {user?.email}
          {role && (
            <span> as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
          )}
        </span>
      </a>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
