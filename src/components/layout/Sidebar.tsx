'use client'

import Link from 'next/link'

interface SidebarProps {
  role: 'Admin' | 'Seller' | 'Customer'
}

export default function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Dashboard {role}</h2>
      <ul className="sidebar-list">
        {role === 'Admin' && (
          <>
            <li><Link href="/dashboard/admin">Dashboard</Link></li>
            <li><Link href="/dashboard/admin/users">User Management</Link></li>
          </>
        )}

        {role === 'Seller' && (
          <>
            <li><Link href="/dashboard/seller/dashboard">Dashboard</Link></li>
            <li><Link href="/dashboard/seller/products">Produk Saya</Link></li>
            <li><Link href="/dashboard/seller/orders">Pesanan</Link></li>
            <li><Link href="/dashboard/seller/chat">Pesan Masuk</Link></li>
            <li><Link href="/dashboard/seller/reviews">Ulasan Produk</Link></li>
            <li><Link href="/dashboard/seller/notifications">Notifikasi</Link></li>
          </>
        )}

        {role === 'Customer' && (
          <>
            <li><Link href="/dashboard/customer">Akun Saya</Link></li>
            <li><Link href="/dashboard/customer/orders">Pesanan Saya</Link></li>
            <li><Link href="/dashboard/customer/chat">Chat dengan Seller</Link></li>
            <li><Link href="/dashboard/customer/reviews">Ulasan Saya</Link></li>
            <li><Link href="/dashboard/customer/settings">Pengaturan Akun</Link></li>
          </>
        )}
      </ul>
    </aside>
  )
}
