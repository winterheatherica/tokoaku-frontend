'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuth } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import VariantList from '@/components/product/VariantList'
import AddVariantForm from '@/components/product/AddVariantForm'
import ImageCropper from '@/components/product/ImageCropper'
import ReviewSummarizationPanel from '@/components/product/ReviewSummarizationPanel'
import './page.css'

interface ProductDetail {
  id: string
  name: string
  description: string
  image_cover_url: string
  product_type_name: string
  product_form_name: string
  created_at: string
  updated_at: string
}

interface ProductVariant {
  id: string
  variant_name: string
  stock: number
}

interface VariantImage {
  image_url: string
  is_cover: boolean
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [variantImages, setVariantImages] = useState<Record<string, VariantImage[]>>({})
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({})
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})
  const [variantName, setVariantName] = useState('')
  const [stock, setStock] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)
  const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id || fetched) return

    const fetchData = async () => {
      try {
        const user = getAuth().currentUser
        if (!user) throw new Error('User not authenticated')
        const token = await user.getIdToken(true)

        const productRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProduct(productRes.data)

        const variantRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products/${id}/variants`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setVariants(variantRes.data)

        for (const variant of variantRes.data) {
          await fetchVariantImages(variant.id)
          await fetchVariantPrice(variant.id)
        }

        setFetched(true)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch product or variant data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, fetched])

  const fetchVariantImages = async (variantId: string) => {
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/variants/${variantId}/images`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setVariantImages(prev => ({ ...prev, [variantId]: res.data || [] }))
    } catch (err: any) {
      console.error(`❌ Failed to fetch images for variant ${variantId}:`, err?.response?.data || err.message)
    }
  }

  const fetchVariantPrice = async (variantId: string) => {
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/variants/${variantId}/price`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.price !== undefined && res.data.price !== null) {
        setVariantPrices(prev => ({ ...prev, [variantId]: res.data.price }))
      }
    } catch {
      // harga belum tersedia
    }
  }

  const handleAddVariant = async () => {
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products/${id}/variants`, {
        variant_name: variantName,
        stock: parseInt(stock) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setVariantName('')
      setStock('')

      const variantRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products/${id}/variants`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVariants(variantRes.data)

      for (const variant of variantRes.data) {
        await fetchVariantImages(variant.id)
      }

      toast.success('Variant added successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add variant')
    }
  }

  const handlePriceInputChange = (variantId: string, price: string) => {
    setPriceInputs(prev => ({ ...prev, [variantId]: price }))
  }

  const handleSetPrice = async (variantId: string) => {
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      const raw = priceInputs[variantId]
      const price = parseInt(raw)

      if (!price || price <= 0 || isNaN(price)) {
        toast.error('Please enter a valid price')
        return
      }

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/variants/${variantId}/price`, { price }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Price added successfully')
      await fetchVariantPrice(variantId)
    } catch (err) {
      console.error(err)
      toast.error('Failed to set price')
    }
  }

  const handleSelectImage = (variantId: string) => {
    setUploadingVariantId(variantId)
    setSelectedFile(null)
    setShowCropper(false)
  }

  const handleCropComplete = async (croppedFile: File) => {
    if (!uploadingVariantId || uploading) return
    setUploading(true)

    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      const formData = new FormData()
      formData.append('file', croppedFile)

      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/variants/${uploadingVariantId}/images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (!uploadRes?.data?.image?.image_url) throw new Error("Upload response invalid")

      await fetchVariantImages(uploadingVariantId)
      toast.success('Image uploaded successfully')
      setShowCropper(false)
      setSelectedFile(null)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Upload error'
      toast.error(`Upload gagal: ${message}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p>Loading product detail...</p>
  if (error) return <p>{error}</p>
  if (!product) return <p>Product not found</p>

  return (
    <div className="product-detail-page">
      <div className="product-header-container">
        <div className="product-image">
          <img src={product.image_cover_url} alt={product.name} />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p><strong>Type:</strong> {product.product_type_name}</p>
          <p><strong>Form:</strong> {product.product_form_name}</p>
          <p><strong>Created At:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
          <p><strong>Last Update:</strong> {new Date(product.updated_at).toLocaleDateString()}</p>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      <ReviewSummarizationPanel productId={product.id} />
      
      <div className="variant-list-container">
        <h2>Variants</h2>
        <VariantList
          variants={variants}
          variantImages={variantImages}
          variantPrices={variantPrices}
          onSelectImage={handleSelectImage}
          priceInputs={priceInputs}
          onPriceInputChange={handlePriceInputChange}
          onSetPrice={handleSetPrice}
          selectedFile={selectedFile}
          showCropper={showCropper}
          uploadingVariantId={uploadingVariantId}
          cropperComponent={
            showCropper && selectedFile ? (
              <ImageCropper imageFile={selectedFile} onCropComplete={handleCropComplete} />
            ) : null
          }
          onFileSelected={(file: File) => {
            setSelectedFile(file)
            setShowCropper(true)
          }}
          fetchVariantImages={fetchVariantImages}
        />
      </div>

      <div className="add-variant-form-container">
        <AddVariantForm
          variantName={variantName}
          stock={stock}
          onChangeName={setVariantName}
          onChangeStock={setStock}
          onAddVariant={handleAddVariant}
          productName={product.name}
        />
      </div>

      <div className="back-button-container">
        <button onClick={() => router.back()} className="btn-teal" type="button">
          Back
        </button>
      </div>
    </div>
  )
}
