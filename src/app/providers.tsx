'use client'

import { ToastProvider } from '@/app/toast-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  )
}
