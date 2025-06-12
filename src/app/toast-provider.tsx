'use client'
import { Toaster } from 'react-hot-toast'
import './toast-provider.css'

export function ToastProvider() {
  return <Toaster position="bottom-right" containerClassName="toaster-container" />
}
