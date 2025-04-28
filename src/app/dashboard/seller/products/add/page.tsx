'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { getAuth } from 'firebase/auth'

const AddProductPage = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [productType, setProductType] = useState('')
    const [productTypes, setProductTypes] = useState<string[]>([]) // Untuk menyimpan list ProductType
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [sellerID, setSellerID] = useState<string>('')

    const router = useRouter()

    // Fetch ProductTypes saat komponen dimuat
    useEffect(() => {
        const fetchProductTypes = async () => {
            try {
                const token = await getAuth().currentUser?.getIdToken(true)
                if (!token) {
                    console.error("[DEBUG] No token found")
                    setError('Authentication failed. No token found.')
                    return
                }

                console.log("[DEBUG] Token for request:", token)

                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/product-types`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Menambahkan Authorization header dengan token
                    }
                })
                setProductTypes(response.data.map((type: any) => type.name)) // Menyimpan nama-nama product type
                console.log("[DEBUG] Product Types fetched:", response.data)
            } catch (err) {
                setError('Failed to fetch product types')
                console.error("[DEBUG] Error fetching product types:", err)
            }
        }

        // Mengambil Seller ID dari Firebase Authentication (UID)
        const fetchSellerID = async () => {
            const auth = getAuth()
            const user = auth.currentUser
            if (user) {
                setSellerID(user.uid)  // Menyimpan UID Firebase sebagai sellerID
                console.log("[DEBUG] Seller ID (UID):", user.uid)
            } else {
                setError('User not authenticated')
                console.error("[DEBUG] No authenticated user found")
            }
        }

        fetchProductTypes()
        fetchSellerID()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Dapatkan token Firebase
            const token = await getAuth().currentUser?.getIdToken(true)
            if (!token) {
                console.error("[DEBUG] Token is missing or invalid")
                setError('Authentication failed. No token found.')
                return
            }

            console.log("[DEBUG] Sending token:", token)  // Debug log token yang akan dikirim

            // Mengirim request POST ke backend untuk menambahkan produk
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/products`, {
                name,
                description,
                seller_id: sellerID,  // Menggunakan sellerID yang sudah diambil dari Firebase
                product_type: productType
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Menampilkan pesan sukses
            setSuccess('Product successfully added!')
            console.log("[DEBUG] Product added successfully:", response.data)

            // Redirect ke halaman produk setelah beberapa detik
            setTimeout(() => {
                router.push('/dashboard/seller/products')
            }, 2000)

        } catch (err: any) {
            // Menangani error jika terjadi
            setError(err.response?.data?.message || 'Failed to add product')
            console.error("[DEBUG] Error adding product:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="name" className="block text-sm font-medium">Product Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                        required
                    />
                </div>

                {/* sellerID diambil dari auth, jadi tidak perlu diinputkan */}
                <div className="form-group">
                    <label htmlFor="seller_id" className="block text-sm font-medium">Seller ID</label>
                    <input
                        type="text"
                        id="seller_id"
                        name="seller_id"
                        value={sellerID}
                        onChange={(e) => setSellerID(e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="product_type" className="block text-sm font-medium">Product Type</label>
                    <select
                        id="product_type"
                        name="product_type"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                        required
                    >
                        <option value="">Select Product Type</option>
                        {productTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    )
}

export default AddProductPage
