import Link from 'next/link'
import AccountView from '@/components/auth/AccountView'

export default function AccountPage() {
  return (
    <main>
      <AccountView />
      <Link href="/dashboard/customer/edit">Edit Akun</Link>
    </main>
  )
}