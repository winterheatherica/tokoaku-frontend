'use client'

import React from 'react'

interface AddProductFormProps {
  name: string
  description: string
  productType: string
  productForm: string
  productTypes: string[]
  productForms: string[]
  onNameChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onTypeChange: (val: string) => void
  onFormChange: (val: string) => void
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  name,
  description,
  productType,
  productForm,
  productTypes,
  productForms,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onFormChange
}) => {
  return (
    <form className="add-product-form" onSubmit={e => e.preventDefault()}>
      <div>
        <label>Product Name</label><br />
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Description</label><br />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Product Type</label><br />
        <select
          value={productType}
          onChange={(e) => onTypeChange(e.target.value)}
          required
        >
          <option value="">Select Product Type</option>
          {productTypes.map((type, i) => (
            <option key={i} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Product Form</label><br />
        <select
          value={productForm}
          onChange={(e) => onFormChange(e.target.value)}
          required
        >
          <option value="">Select Product Form</option>
          {productForms.map((form, i) => (
            <option key={i} value={form}>{form}</option>
          ))}
        </select>
      </div>
    </form>
  )
}

export default AddProductForm
