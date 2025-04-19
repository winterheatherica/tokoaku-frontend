'use client'

import { useRouter, useParams } from 'next/navigation'
import { ProductCardProps } from '@/components/product/ProductCard'

const dummyProduk: ProductCardProps[] = [
  { id: '1', name: 'Produk Dummy 1', price: 120000, imageUrl: '/file.svg' },
  { id: '2', name: 'Produk Dummy 2', price: 85000, imageUrl: '/file.svg' },
]

export default function DetailProdukPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const produk = dummyProduk.find((item) => item.id === id)

  if (!produk) {
    return (
      <div>
        <h2>Produk tidak ditemukan.</h2>
        <button onClick={() => router.back()}>Kembali</button>
      </div>
    )
  }

  return (
    <div>
      <img src={produk.imageUrl} alt={produk.name} />
      <h1>{produk.name}</h1>
      <p>Rp{produk.price.toLocaleString('id-ID')}</p>
      <button onClick={() => router.back()}>Kembali</button>
    </div>
  )
}
