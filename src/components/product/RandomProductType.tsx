'use client'

import ProductCard from './ProductCard'
import type { ProductCardProps } from './ProductCard'
import './RandomProductForm.css' // Reuse css yang sama

interface RandomProductTypeProps {
    productTypes: any[]
    currentTypeName: string
    typeId: string
    products: ProductCardProps[]
    productLoading: boolean
    onTypeChange: (newTypeId: string, newTypeName: string) => Promise<void>
}

export default function RandomProductType({
    productTypes,
    currentTypeName,
    typeId,
    products,
    productLoading,
    onTypeChange,
}: RandomProductTypeProps) {
    const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 3)

    return (
        <div className="random-form-container">
            <div className="random-form-products">
                {productLoading ? (
                    <p>Memuat produk...</p>
                ) : selectedProducts.length > 0 ? (
                    selectedProducts.map((produk) => (
                        <ProductCard key={produk.id} {...produk} />
                    ))
                ) : (
                    <p>Tidak ada produk untuk tipe ini.</p>
                )}
            </div>

            <div className="random-form-dropdown">
                <div className="custom-dropdown">
                    <span>{currentTypeName} ▼</span>
                    <div className="custom-dropdown-content">
                        {productTypes.map((type) => (
                            <div
                                key={type.id}
                                className={`dropdown-item ${typeId === String(type.id) ? 'active' : ''}`}
                                onClick={() => onTypeChange(String(type.id), type.name)}
                            >
                                {type.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
