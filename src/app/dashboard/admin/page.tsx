import Link from 'next/link'
import AccountView from '@/components/auth/AccountView'

export default function AccountPage() {
  return (
    <main>
      <h1>Dashboard Admin</h1>
      <AccountView />
      <Link href="/dashboard/admin">Edit Akun</Link>
      <Link href="/dashboard/admin/users">User Management</Link>
    </main>
  )
}
