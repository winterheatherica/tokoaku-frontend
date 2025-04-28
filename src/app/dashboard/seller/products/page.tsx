'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import firebaseApp from '@/lib/firebase/config'
import axios from 'axios'
import ProductCard, { ProductCardProps } from '@/components/product/ProductCard'

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const auth = getAuth(firebaseApp)
        const user = auth.currentUser
        if (!user) throw new Error('Kamu belum login')

        const token = await user.getIdToken(true)

        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = res.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url ?? '/no-image.png', // fallback img
        }))

        setProducts(data)
      } catch (err: any) {
        console.error('[SellerProductsPage] Gagal fetch:', err)
        setError(err.response?.data?.message || 'Gagal memuat produk')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div>
      <h2>Produk Saya</h2>

      {loading && <p>Memuat produk...</p>}
      {error && <p>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  )
}
