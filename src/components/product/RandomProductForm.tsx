'use client'

import ProductCard from './ProductCard'
import type { ProductCardProps } from './ProductCard'
import './RandomProductForm.css'

interface RandomProductFormProps {
    productForms: any[]
    currentFormName: string
    formId: string
    products: ProductCardProps[]
    productLoading: boolean
    onFormChange: (newFormId: string, newFormName: string) => void // Ubah ke void
}

export default function RandomProductForm({
    productForms,
    currentFormName,
    formId,
    products,
    productLoading,
    onFormChange,
}: RandomProductFormProps) {
    const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 3)

    return (
        <div className="random-form-container">
            <div className="random-form-dropdown">
                <div className="custom-dropdown">
                    <span>{currentFormName} ▼</span>
                    <div className="custom-dropdown-content">
                        {productForms.map((form) => (
                            <div
                                key={form.id}
                                className={`dropdown-item ${formId === String(form.id) ? 'active' : ''}`}
                                onClick={() => onFormChange(String(form.id), form.form)}
                            >
                                {form.form}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="random-form-products">
                {productLoading ? (
                    <p>Memuat produk...</p>
                ) : selectedProducts.length > 0 ? (
                    selectedProducts.map((produk) => (
                        <ProductCard key={produk.id} {...produk} />
                    ))
                ) : (
                    <p>Tidak ada produk untuk form ini.</p>
                )}
            </div>
        </div>
    )
}
