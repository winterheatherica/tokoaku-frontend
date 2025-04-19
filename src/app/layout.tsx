import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tokoaku',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head />
      <body>{children}</body>
    </html>
  )
}
