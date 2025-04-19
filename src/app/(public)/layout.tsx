import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Header title="Selamat Datang di Tokoaku" />
      <main>{children}</main>
      <Footer />
    </>
  )
}
