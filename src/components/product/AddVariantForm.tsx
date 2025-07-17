import React from 'react'
import './AddVariantForm.css'

interface Props {
  variantName: string
  stock: string
  onChangeName: (name: string) => void
  onChangeStock: (stock: string) => void
  onAddVariant: () => void
  productName: string
}

export default function AddVariantForm({
  variantName,
  stock,
  onChangeName,
  onChangeStock,
  onAddVariant,
  productName
}: Props) {
  return (
    <>
      <h2 className="add-variant-title">Tambah Variant Produk</h2>
      <div className="add-variant-form">
        <label>
          <span className="form-label">Nama Variant</span>
          <input
            type="text"
            placeholder={`Contoh: ${productName} - A1`}
            value={variantName}
            onChange={(e) => onChangeName(e.target.value)}
            className="form-input"
          />
        </label>
        <label>
          <span className="form-label">Stok</span>
          <input
            type="number"
            placeholder="Contoh: 1000"
            value={stock}
            onChange={(e) => onChangeStock(String(e.target.value))}
            className="form-input"
          />
        </label>
        <button type="button" className="add-product-btn" onClick={onAddVariant}>
          Tambah Varian
        </button>
      </div>
    </>
  )
}
