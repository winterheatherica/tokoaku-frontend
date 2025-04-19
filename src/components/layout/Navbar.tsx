'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from '@/components/auth/AuthButton'

export default function Navbar() {
  const pathname = usePathname()
  const isOnVerifyPage = pathname?.startsWith('/verify')

  return (
    <nav className="navbar" aria-label="Navigasi Utama">
      <Link href="/" className="navbar-brand">Tokoaku</Link>
      <div className="navbar-links">
        <Link href="/cart">Keranjang</Link>
        <Link href="/account">Akun</Link>
        {!isOnVerifyPage && <AuthButton />}
      </div>
    </nav>
  )
}

