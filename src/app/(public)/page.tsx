'use client'

import ProductCard from '@/components/product/ProductCard'
import type { ProductCardProps } from '@/components/product/ProductCard'

const dummyProduk: ProductCardProps[] = [
  { id: '1', name: 'Produk Dummy 1', price: 120000, imageUrl: '/file.svg' },
  { id: '2', name: 'Produk Dummy 2', price: 85000, imageUrl: '/file.svg' },
]

export default function Home() {
  return (
    <div>
      {dummyProduk.map((produk) => (
        <ProductCard key={produk.id} {...produk} />
      ))}
    </div>
  )
}
