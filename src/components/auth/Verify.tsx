'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'

export default function Verify() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email')
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    if (!email || !token) {
      setStatus('error')
      setMessage('Link verifikasi tidak valid atau sudah kadaluarsa.\nSilakan minta ulang link dari halaman registrasi.')
      return
    }

    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    const verifyAndLogin = async () => {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
          email,
          token,
        })

        const { customToken, role } = res.data
        if (!customToken) throw new Error('Custom token tidak ditemukan')

        const auth = getAuth(firebaseApp)
        await signInWithCustomToken(auth, customToken)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        setMessage('Akun berhasil diverifikasi dan login!')
        setStatus('success')

        router.push('/')
      } catch (err: any) {
        console.log('[Verifikasi] Error:', err)
        if (err.response?.status === 429) {
          setMessage('Verifikasi sedang diproses. Coba lagi dalam beberapa saat...')
        } else {
          setMessage(err.response?.data?.message || err.message || 'Gagal proses verifikasi')
        }
        setStatus('error')
      }
    }

    verifyAndLogin()
  }, [email, token, router])

  return (
    <div>
      <h1>Verifikasi Email</h1>
      {status === 'loading' && <p>Mengecek token verifikasi...</p>}
      {status === 'success' && <p>{message}</p>}
      {status === 'error' && (
        <div>
          <p>{message}</p>
          <button onClick={() => router.push('/register')}>
            Kembali ke Registrasi
          </button>
        </div>
      )}
    </div>
  )
}
