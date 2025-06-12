'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import AddProductForm from '@/components/product/AddProductForm'
import ProductImageUploader from '@/components/product/ProductImageUploader'
import './page.css'

export default function AddProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [productType, setProductType] = useState('')
  const [productForm, setProductForm] = useState('')
  const [originalImage, setOriginalImage] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const [productTypes, setProductTypes] = useState<string[]>([])
  const [productForms, setProductForms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const user = getAuth().currentUser
        if (!user) throw new Error('User not authenticated')

        const token = await user.getIdToken(true)

        const [typesRes, formsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product-types`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product-forms`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setProductTypes(typesRes.data.map((t: any) => t.name))
        setProductForms(formsRes.data.map((f: any) => f.form))
      } catch (err) {
        setError('Failed to load product types or forms')
      }
    }

    fetchDropdownData()
  }, [])

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      if (!croppedImage) {
        toast.error('Please select and crop an image.')
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', croppedImage)

      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )

      const imageUrl = uploadRes.data.secure_url

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products`,
        {
          name,
          description,
          product_type: productType,
          product_form: productForm,
          image_cover_url: imageUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      toast.success('Product successfully added!')
      setSuccess('Product successfully added!')
      setTimeout(() => router.push('/dashboard/products'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add product')
      toast.error(err.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-product-container">
      <h2 className="page-title">Add New Product</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <AddProductForm
        name={name}
        description={description}
        productType={productType}
        productForm={productForm}
        productTypes={productTypes}
        productForms={productForms}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onTypeChange={setProductType}
        onFormChange={setProductForm}
      />

      <ProductImageUploader
        originalImage={originalImage}
        setOriginalImage={setOriginalImage}
        setCroppedImage={setCroppedImage}
      />

      <div className="button-submit-container">
        <button
          className="btn-add-product"
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </div>
    </div>
  )
}
