'use client'

import React from 'react'
import Link from 'next/link'
import './ProductFormList.css'

type ProductForm = {
    id: number;
    form: string;
    slug: string;
    image_url: string;
    cloud_image_id: number;
    created_at: string;
};

interface ProductFormListProps {
    productForms: ProductForm[];
}

const ProductFormList: React.FC<ProductFormListProps> = ({ productForms }) => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="product-form-heading">Product Form</h1>
            <div className="product-form-list">
                {productForms.map((form) => (
                    <Link key={form.id} href={`/product-form/${form.slug}`} className="product-form-card-link">
                        <div className="product-form-card">
                            <img src={form.image_url} alt={form.form} className="product-form-image" />
                            <div className="product-form-content">
                                <h2 className="product-form-title">{form.form}</h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ProductFormList
