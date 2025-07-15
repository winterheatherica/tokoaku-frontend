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

    return (
        <div className="page-container">
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

        </div>
    )
}
