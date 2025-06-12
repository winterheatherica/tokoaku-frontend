import React from 'react'

interface Props {
  variantName: string
  stock: string
  onChangeName: (name: string) => void
  onChangeStock: (stock: string) => void
  onAddVariant: () => void
  productName: string
}

export default function AddVariantForm({
  variantName, stock, onChangeName, onChangeStock, onAddVariant, productName
}: Props) {
  return (
    <div>
      <h2>Add Product Variant</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        <label>
          Variant Name:
          <input
            type="text"
            placeholder={`Contoh: ${productName} - A1`}
            value={variantName}
            onChange={(e) => onChangeName(e.target.value)}
          />
        </label>
        <label>
          Stock:
          <input
            type="number"
            placeholder="Contoh: 1000"
            value={stock}
            onChange={(e) => onChangeStock(String(e.target.value))}
          />
        </label>
        <button onClick={onAddVariant}>Add Variant</button>
      </div>
    </div>
  )
}