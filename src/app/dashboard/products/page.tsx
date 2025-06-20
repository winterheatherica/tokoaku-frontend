'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import axios from 'axios'
import Link from 'next/link'
import './page.css'

interface Product {
  id: string
  name: string
  description: string
  image_cover_url: string
  product_type_name: string
  product_form_name: string
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = getAuth().currentUser
        if (!user) throw new Error('User not authenticated')

        const token = await user.getIdToken(true)

        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        setProducts(res.data)
      } catch (err) {
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <div>Loading products...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div className="seller-products-container">
      <div className="add-product-button-container">
        <Link href="/dashboard/products/add" className="btn-teal add-product-btn">
          + Tambah Product
        </Link>
      </div>

      <h2>My Products</h2>
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <img src={product.image_cover_url} alt={product.name} />
          <div className="product-info">
            <h3>
              <Link href={`/dashboard/products/${product.id}`}>
                {product.name}
              </Link>
            </h3>
            <p>{product.description}</p>
            <p>Type: {product.product_type_name}</p>
            <p>Form: {product.product_form_name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
