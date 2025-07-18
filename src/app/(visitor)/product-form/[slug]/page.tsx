'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import './page.css'

interface ProductCard {
    id: number
    name: string
    image_cover_url: string
    slug: string
    variant_slug: string
    min_price: number
    max_price: number
}

export default function ProductFormSlugPage() {
    const { slug } = useParams()
    const [products, setProducts] = useState<ProductCard[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!slug) return
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product-form/${slug}`)
            .then(res => setProducts(res.data.data || []))
            .catch(err => console.error('❌ Gagal fetch:', err))
            .finally(() => setLoading(false))
    }, [slug])

    return (
        <div className="container mx-auto p-4">
            <h1 className="slug-product-heading">Product Form: {slug}</h1>
            {loading ? (
                <p>Memuat produk...</p>
            ) : products.length === 0 ? (
                <p>Tidak ada produk ditemukan.</p>
            ) : (
                <div className="slug-product-list slug-grid-5">
                {products.map((product) => (
                    <a
                        key={product.id}
                        href={`/product/${product.slug}/variant/${product.variant_slug}`}
                        className="slug-product-card-link"
                    >
                        <div className="slug-product-card">
                            <img
                                src={product.image_cover_url || '/default-product.jpg'}
                                alt={product.name}
                                className="slug-product-image"
                            />
                            <div className="slug-product-content">
                                <div>
                                    <h2 className="slug-product-title">{product.name}</h2>
                                    <p className="slug-product-price">
                                        {product.min_price != null && product.max_price != null
                                            ? `Rp${product.min_price.toLocaleString()} – Rp${product.max_price.toLocaleString()}`
                                            : 'Harga tidak tersedia'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
                </div>
            )}
        </div>
    )
}
