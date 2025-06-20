'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getAuth } from 'firebase/auth'

export default function SummarizePositivePage() {
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  const handleSummarize = async () => {
    setLoading(true)
    setSummary('')
    setError('')

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) throw new Error('Kamu belum login')

      const token = await user.getIdToken()

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products/${id}/summarize/positive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat ringkasan')
      }

      setSummary(data.summary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Ringkasan Review Positif</h1>

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Buat Ringkasan'}
      </button>

      {summary && (
        <div className="mt-4 p-4 border rounded bg-green-50 text-green-900">
          <strong>Hasil Ringkasan:</strong>
          <p className="mt-2 whitespace-pre-line">{summary}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border rounded bg-red-100 text-red-800">
          <strong>Gagal:</strong> {error}
        </div>
      )}
    </div>
  )
}
