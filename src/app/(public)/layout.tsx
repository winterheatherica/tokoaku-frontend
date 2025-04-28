import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Header title={`Selamat Datang di ${process.env.NEXT_PUBLIC_SITE_NAME}`} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
