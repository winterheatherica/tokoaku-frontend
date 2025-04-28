'use client'

import { useAuth } from '@/hooks/useAuth'

export default function SellerDashboardPage() {
  const { role, user } = useAuth()

  return (
    <div>
      <h1>Dashboard Seller</h1>
      <p>UID: {user?.uid}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {role}</p>
    </div>
  )
}
