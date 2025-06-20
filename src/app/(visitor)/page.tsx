'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import type { ProductCardProps } from '@/components/product/ProductCard'
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
    const [formId, setFormId] = useState<string>('')
    const [currentFormName, setCurrentFormName] = useState<string>('▼')
    const [productsByForm, setProductsByForm] = useState<ProductCardProps[]>([])
    const [productFormLoading, setProductFormLoading] = useState(false)

    const [productTypes, setProductTypes] = useState<any[]>([])
    const [typeId, setTypeId] = useState<string>('')
    const [currentTypeName, setCurrentTypeName] = useState<string>('▼')
    const [productsByType, setProductsByType] = useState<ProductCardProps[]>([])
    const [productTypeLoading, setProductTypeLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product-reference`)
                const forms = res.data.product_forms || []
                const types = res.data.product_types || []

                setProductForms(forms)
                setProductTypes(types)

                // Tambah random form dan type
                if (forms.length > 0) {
                    const randomForm = forms[Math.floor(Math.random() * forms.length)]
                    setFormId(String(randomForm.id))
                    setCurrentFormName(randomForm.form)
                    fetchProductsByForm(String(randomForm.id))
                }

                if (types.length > 0) {
                    const randomType = types[Math.floor(Math.random() * types.length)]
                    setTypeId(String(randomType.id))
                    setCurrentTypeName(randomType.name)
                    fetchProductsByType(String(randomType.id))
                }

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

    const fetchProductsByForm = async (formId: string) => {
        setProductFormLoading(true)
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/products-by-form`, {
                params: { form_id: formId }
            })
            const data = (res.data.data || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                imageUrl: item.image_cover_url || '/default-product.jpg',
                productSlug: item.slug,
                variantSlug: item.variant_slug,
                minPrice: item.min_price,
                maxPrice: item.max_price,
            }))
            setProductsByForm(data)
        } catch (err) {
            console.error('❌ Gagal ambil produk Form:', err)
        } finally {
            setProductFormLoading(false)
        }
    }

    const fetchProductsByType = async (typeId: string) => {
        setProductTypeLoading(true)
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/products-by-type`, {
                params: { type_id: typeId }
            })
            const data = (res.data.data || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                imageUrl: item.image_cover_url || '/default-product.jpg',
                productSlug: item.slug,
                variantSlug: item.variant_slug,
                minPrice: item.min_price,
                maxPrice: item.max_price,
            }))
            setProductsByType(data)
        } catch (err) {
            console.error('❌ Gagal ambil produk Type:', err)
        } finally {
            setProductTypeLoading(false)
        }
    }

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
