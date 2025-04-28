'use client'

import Link from 'next/link'

export interface ProductCardProps {
  id: string
  name: string
  price: number
  imageUrl: string
}

export default function ProductCard({ id, name, price, imageUrl }: ProductCardProps) {
  return (
    <div className="product-card">
      <img src={imageUrl} alt={name} className="product-image" />
      <div className="product-content">
        <h3 className="product-title">{name}</h3>
        <p className="product-price">Rp{price.toLocaleString('id-ID')}</p>
        <Link href={`/product/${id}`} className="product-link">Lihat Detail</Link>
      </div>
    </div>
  )
}
