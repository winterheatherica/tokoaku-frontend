'use client'

import React, { useState } from 'react'
import VariantImageUploader from '@/components/product/VariantImageUploader'
import { getAuth } from 'firebase/auth'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface ProductVariant {
  id: string
  variant_name: string
  stock: number
}

interface VariantImage {
  image_url: string
  is_cover: boolean
}

interface VariantListProps {
  variants: ProductVariant[]
  variantImages: Record<string, VariantImage[]>
  variantPrices: Record<string, number>
  onSelectImage: (variantId: string) => void
  priceInputs: Record<string, string>
  onPriceInputChange: (variantId: string, price: string) => void
  onSetPrice: (variantId: string) => void
  selectedFile: File | null
  showCropper: boolean
  uploadingVariantId: string | null
  cropperComponent: React.ReactNode
  onFileSelected: (file: File) => void
  fetchVariantImages: (variantId: string) => Promise<void>
}

const VariantList: React.FC<VariantListProps> = ({
  variants,
  variantImages,
  variantPrices,
  onSelectImage,
  priceInputs,
  onPriceInputChange,
  onSetPrice,
  selectedFile,
  showCropper,
  uploadingVariantId,
  cropperComponent,
  onFileSelected,
  fetchVariantImages
}) => {
  const [editingCoverFor, setEditingCoverFor] = useState<string | null>(null)
  const [selectedCoverImageUrl, setSelectedCoverImageUrl] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)

  const handleSetCoverClick = async (variantId: string) => {
    const imageUrl = selectedCoverImageUrl[variantId]
    if (!imageUrl) {
      toast.error('Pilih gambar terlebih dahulu')
      return
    }
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('User not authenticated')
      const token = await user.getIdToken(true)

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/variants/${variantId}/cover`,
        { image_url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Variant cover updated')
      setEditingCoverFor(null)
      await fetchVariantImages(variantId)
    } catch (err) {
      console.error(err)
      toast.error('Failed to set variant cover')
    }
  }

  return (
    <div className="variant-list-root">
      <h2>Product Variants</h2>
      <button
        className="btn-teal"
        onClick={() => {
          setIsEditing(prev => !prev)
          setEditingCoverFor(null)
        }}
        type="button"
      >
        {isEditing ? 'Cancel Edit' : 'Edit Variants'}
      </button>

      {variants.length === 0 ? (
        <p>No variants available.</p>
      ) : (
        <ul className="variant-list">
          {variants.map(variant => (
            <li key={variant.id} className="variant-item">
              <p className="variant-header">
                <strong className="variant-name">{variant.variant_name}</strong>
              </p>

              <p className="variant-price">
                Harga Saat Ini:{' '}
                {variantPrices[variant.id] !== undefined
                  ? `Rp ${variantPrices[variant.id].toLocaleString()}`
                  : 'Belum ada harga'}
              </p>

              <p className="variant-stock">Stock: {variant.stock}</p>

              <div className="variant-images">
                {variantImages[variant.id]?.map((img, idx) => (
                  <label key={idx} className="variant-image-label">
                    <img
                      src={img.image_url}
                      alt={`Variant ${variant.variant_name} image ${idx + 1}`}
                      className={`variant-image ${img.is_cover ? 'cover-selected' : ''}`}
                      width={80}
                      height={80}
                    />
                    {editingCoverFor === variant.id && (
                      <input
                        type="radio"
                        name={`cover-${variant.id}`}
                        checked={selectedCoverImageUrl[variant.id] === img.image_url}
                        onChange={() =>
                          setSelectedCoverImageUrl(prev => ({ ...prev, [variant.id]: img.image_url }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>

              {isEditing && (
                <div className="variant-edit-section">
                  <div className="price-input-group">
                    <input
                      type="number"
                      value={priceInputs[variant.id] ?? ''}
                      onChange={e => onPriceInputChange(variant.id, e.target.value)}
                      placeholder="Harga baru"
                      className="input-price"
                    />
                    <button
                      type="button"
                      className="btn-teal-small"
                      onClick={() => onSetPrice(variant.id)}
                    >
                      Set Price
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn-teal-small edit-cover-btn"
                    onClick={() => {
                      const isNowEditing = editingCoverFor === variant.id
                      setEditingCoverFor(isNowEditing ? null : variant.id)

                      if (!isNowEditing && !selectedCoverImageUrl[variant.id]) {
                        const currentCover = variantImages[variant.id]?.find(img => img.is_cover)
                        if (currentCover) {
                          setSelectedCoverImageUrl(prev => ({ ...prev, [variant.id]: currentCover.image_url }))
                        }
                      }
                    }}
                  >
                    {editingCoverFor === variant.id ? 'Cancel' : 'Edit Variant Cover'}
                  </button>

                  {editingCoverFor === variant.id && (
                    <button
                      type="button"
                      className="btn-teal-small set-cover-btn"
                      onClick={() => handleSetCoverClick(variant.id)}
                    >
                      Set Variant Cover
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-teal-small upload-btn"
                    onClick={() => onSelectImage(variant.id)}
                  >
                    Upload Image
                  </button>

                  {uploadingVariantId === variant.id && (
                    <div className="upload-uploader-wrapper">
                      <VariantImageUploader onSelectFile={onFileSelected} />
                    </div>
                  )}

                  {uploadingVariantId === variant.id && showCropper && selectedFile && (
                    <div className="upload-cropper-wrapper">{cropperComponent}</div>
                  )}

                  
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default VariantList
