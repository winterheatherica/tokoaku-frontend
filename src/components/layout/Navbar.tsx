'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import AuthButton from '@/components/auth/AuthButton'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, isLoggedIn, loading } = useAuth()

  const [search, setSearch] = useState('')

  const isHidden =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/verify')

  const dashboardLink = role
    ? `/dashboard/${role.toLowerCase()}`
    : '/dashboard'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?query=${encodeURIComponent(search)}`)
    }
  }

  return (
    <nav className="navbar" aria-label="Navigasi Utama">
      <Link href="/" className="navbar-brand">{process.env.NEXT_PUBLIC_SITE_NAME}</Link>

      <form onSubmit={handleSearch} className="navbar-search">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Cari</button>
      </form>

      <div className="navbar-links">
        <Link href="/dashboard/customer/cart">Cart</Link>
        {isLoggedIn && !loading && (
          <Link href={dashboardLink}>Dashboard</Link>
        )}
        {!isHidden && <AuthButton />}
      </div>
    </nav>
  )
}
