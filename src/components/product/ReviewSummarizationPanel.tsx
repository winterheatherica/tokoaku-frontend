'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import axios from 'axios'
import './ReviewSummarizationPanel.css'
import TypingText from './TypingText'

interface ReviewSummary {
  product_id: string
  sentiment_id: number
  review_count: number
  latest_summary: string
}

export default function ReviewSummarizationPanel({ productId }: { productId: string }) {
  const [positive, setPositive] = useState<ReviewSummary | null>(null)
  const [negative, setNegative] = useState<ReviewSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const [positiveRes, negativeRes] = await Promise.allSettled([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/products/${productId}/summarize/positive`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/products/${productId}/summarize/negative`),
        ])

        if (positiveRes.status === "fulfilled") {
          setPositive(positiveRes.value.data)
        } else {
          setPositive(null)
          if (positiveRes.reason?.response?.status !== 404)
            setError("Gagal mengambil ringkasan review positif.")
        }

        if (negativeRes.status === "fulfilled") {
          setNegative(negativeRes.value.data)
        } else {
          setNegative(null)
          if (negativeRes.reason?.response?.status !== 404)
            setError("Gagal mengambil ringkasan review negatif.")
        }

        if (positiveRes.status === "fulfilled" || negativeRes.status === "fulfilled") {
          setError(null)
        }
      } catch (err) {
        console.error("❌ Gagal fetch summary:", err)
        setError("Terjadi kesalahan saat memuat ringkasan.")
        setPositive(null)
        setNegative(null)
      }
    }

    if (productId) {
      fetchSummaries()
    }
  }, [productId])

  if (error) return <p style={{ color: "red", marginBottom: 24 }}>{error}</p>

  return (
    <div className="summary-panel">
      <div className="summary-card positive">
        <h3>Positif</h3>
        {positive ? (
          <>
            <p className="summary-count">Ringkasan positif paling baru</p>
            <TypingText text={`"${positive.latest_summary}"`} />
          </>
        ) : (
          <p className="summary-text">Ringkasan positif belum tersedia karena belum mencapai 20 ulasan</p>
        )}
      </div>

      <div className="summary-card negative">
        <h3>Negatif</h3>
        {negative ? (
          <>
            <p className="summary-count">Ringkasan negatif paling baru</p>
            <p className="summary-text">
              <TypingText text={`"${negative.latest_summary}"`} />
            </p>
          </>
        ) : (
          <p className="summary-text">Ringkasan negatif belum tersedia karena belum mencapai 20 ulasan</p>
        )}
      </div>
    </div>
  )
}
