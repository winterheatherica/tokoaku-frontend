'use client'

import Link from 'next/link'
import './ProductCard.css'

export interface ProductCardProps {
  id: string
  name: string
  imageUrl: string
  productSlug: string
  variantSlug: string
  minPrice?: number
  maxPrice?: number
}

export default function ProductCard({
  id,
  name,
  imageUrl,
  productSlug,
  variantSlug,
  minPrice,
  maxPrice
}: ProductCardProps) {
  const displayPrice = () => {
    if (minPrice == null || maxPrice == null) return 'Harga belum tersedia'
    if (minPrice === maxPrice) return `Rp${minPrice.toLocaleString('id-ID')}`
    return `Rp${minPrice.toLocaleString('id-ID')} - Rp${maxPrice.toLocaleString('id-ID')}`
  }

  return (
    <Link href={`/product/${productSlug}/variant/${variantSlug}`} className="product-card-link">
      <div className="product-card">
        <img
          src={imageUrl}
          alt={name}
          className="product-image"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/default-product.jpg'
          }}
        />
        <div className="product-content">
          <h3 className="product-title">{name}</h3>
          <p className="product-price">{displayPrice()}</p>
        </div>
      </div>
    </Link>
  )
}
