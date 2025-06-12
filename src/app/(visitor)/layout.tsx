'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import '@/styles/global.css'
import './layout.css'

interface Category {
  id: number
  name: string
  slug: string
  code?: string
}

interface CategoryLabel {
  id: number
  name: string
  categories: Category[]
}

interface ReferenceData {
  product_forms: any[]
  product_types: any[]
  category_labels: CategoryLabel[]
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    product_forms: [],
    product_types: [],
    category_labels: []
  })

  useEffect(() => {
    async function fetchReference() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product-reference`)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        console.log('✅ Data fetched (raw):', data)

        if (!data.category_labels) {
          console.warn('⚠️ category_labels kosong atau null!')
        }

        const safeCategoryLabels = (data.category_labels || []).map((label: any) => ({
          ...label,
          categories: Array.isArray(label.categories) ? label.categories : []
        }))

        console.log('✅ category_labels (after mapping):', safeCategoryLabels)

        setReferenceData({
          product_forms: data.product_forms || [],
          product_types: data.product_types || [],
          category_labels: safeCategoryLabels
        })
      } catch (err) {
        console.error('❌ Gagal fetch reference data:', err)
      }
    }
    fetchReference()
  }, [])

  return (
    <div className="layout-wrapper">
      <Navbar referenceData={referenceData} />
      <main>
        <div className="main-visitor">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
