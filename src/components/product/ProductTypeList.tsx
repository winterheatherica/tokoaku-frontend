'use client'

import React from 'react'
import Link from 'next/link'
import './ProductTypeList.css'

type ProductType = {
    id: number;
    name: string;
    slug: string;
    image_url: string;
    cloud_image_id: number;
    created_at: string;
};

interface ProductTypeListProps {
    productTypes: ProductType[];
}

const ProductTypeList: React.FC<ProductTypeListProps> = ({ productTypes }) => {
    const rows = [];
    for (let i = 0; i < productTypes.length; i += 4) {
        rows.push(productTypes.slice(i, i + 4));
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="product-type-heading">Product Type</h1>
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="product-type-list">
                    {row.map((type) => (
                        <Link
                            key={type.id}
                            href={`/product-type/${type.slug}`}
                            className="product-type-card-link"
                        >
                            <div className="product-type-card">
                                <img
                                    src={type.image_url}
                                    alt={type.name}
                                    className="product-type-image"
                                />
                                <div className="product-type-content">
                                    <h2 className="product-type-title">{type.name}</h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default ProductTypeList
