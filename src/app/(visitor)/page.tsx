'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '@/components/layout/Header'
import HighlightedProduct from '@/components/product/HighlightedProduct'
import ProductFormList from '@/components/product/ProductFormList'
import ProductTypeList from '@/components/product/ProductTypeList'
import './page.css'

export default function Home() {
    const [pageLoading, setPageLoading] = useState(true)
    const [banners, setBanners] = useState<any[]>([])
    const [highlightedProduct, setHighlightedProduct] = useState<any>(null)
    const [productForms, setProductForms] = useState<any[]>([])
    const [productTypes, setProductTypes] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product-reference`)

                const forms = (res.data.product_forms || []).sort((a: any, b: any) => a.id - b.id)
                const types = (res.data.product_types || []).sort((a: any, b: any) => a.id - b.id)

                setProductForms(forms)
                setProductTypes(types)

                const [bannerRes, highlightedRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/discount-banner`),
                    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/highlighted-product`),
                ])
                setBanners(bannerRes.data?.data || [])
                setHighlightedProduct(highlightedRes.data)
            } catch (err) {
                console.error('❌ Gagal ambil data:', err)
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [])

    if (pageLoading) return <p>Loading halaman...</p>

    const isBackendDown =
        (!banners || banners.length === 0) &&
        !highlightedProduct &&
        (!productForms || productForms.length === 0) &&
        (!productTypes || productTypes.length === 0)

    return (
        <div className="page-container">
            {isBackendDown ? (
                <div className="backend-down-wrapper">
                    <div className="backend-down-box">
                    <p className="backend-down-message">Server Backend-nya mati 😢,</p>
                    <p className="backend-down-message">untuk demo websitenya bisa cek link berikut:</p>
                    <a
                        href="https://youtu.be/-Ot6dHHO-eg?si=w61QqmzOiS_8CS6o"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="demo-button"
                    >
                        Lihat Demo Website
                    </a>
                    </div>
                </div>
            ) : (
                <>
                    <div className="header-section">
                        <Header banners={banners} />
                    </div>

                    {highlightedProduct && (
                        <div className="highlighted-product-section">
                            <HighlightedProduct data={highlightedProduct} />
                        </div>
                    )}

                    <div className="product-form-list-container">
                        <ProductFormList productForms={productForms} />
                    </div>

                    <div className="product-type-list-container">
                        <ProductTypeList productTypes={productTypes} />
                    </div>
                </>
            )}
        </div>
    )
}
