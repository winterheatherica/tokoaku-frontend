'use client'

import React, { useRef } from 'react'
import ImageCropper from './ImageCropper'

interface ProductImageUploaderProps {
  originalImage: File | null
  setOriginalImage: (file: File | null) => void
  setCroppedImage: (file: File) => void
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  originalImage,
  setOriginalImage,
  setCroppedImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setOriginalImage(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="product-image-uploader">
      <label>Product Image</label><br />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button type="button" className="choose-file-btn" onClick={handleClick}>
        Choose Image
      </button>

      {originalImage && (
        <ImageCropper
          imageFile={originalImage}
          onCropComplete={(cropped) => setCroppedImage(cropped)}
        />
      )}
    </div>
  )
}

export default ProductImageUploader
