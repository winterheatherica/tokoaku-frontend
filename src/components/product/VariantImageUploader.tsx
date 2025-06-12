'use client'

import React, { useRef } from 'react'

interface Props {
  onSelectFile: (file: File) => void
}

export default function VariantImageUploader({ onSelectFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSelectFile(file)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button
        type="button"
        className="upload-btn"   // pasang class CSS di sini
        onClick={handleClick}
      >
        Select Image
      </button>
    </>
  )
}
