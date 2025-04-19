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
      <h3 className="product-title">{name}</h3>
      <p className="product-price">Rp{price.toLocaleString('id-ID')}</p>
      <Link href={`/product/${id}`} className="product-detail-link">Lihat Detail</Link>
    </div>
  )
}
