'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './page.css'

interface CartItem {
  product_variant_id: string
  product_name: string
  product_slug: string
  product_variant_name: string
  product_variant_slug: string
  quantity: number
  image_url: string
  added_at: string
  is_selected: boolean
  product_variant_images: string[]
}

interface GroupedProduct {
  product_name: string
  cart_items: CartItem[]
}

interface GroupedCart {
  seller_name: string
  products: GroupedProduct[]
}

export default function CustomerCartPage() {
  const [groupedCart, setGroupedCart] = useState<GroupedCart[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchCart = async () => {
    try {
      const user = getAuth().currentUser
      if (!user) throw new Error('Silakan login terlebih dahulu')

      const token = await user.getIdToken(true)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/cart/grouped`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGroupedCart(res.data)
    } catch (err) {
      console.error('❌ Gagal mengambil keranjang:', err)
      toast.error('Gagal mengambil data keranjang')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleSelectChange = async (variantID: string, checked: boolean) => {
    try {
      const token = await getAuth().currentUser?.getIdToken(true)
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/cart/select`, {
        product_variant_id: variantID,
        is_selected: checked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Berhasil mengubah status item')
      // update local state tanpa fetch ulang
      setGroupedCart(prev => prev.map(seller => ({
        ...seller,
        products: seller.products.map(product => ({
          ...product,
          cart_items: product.cart_items.map(item =>
            item.product_variant_id === variantID ? { ...item, is_selected: checked } : item
          )
        }))
      })))
    } catch {
      toast.error('Gagal mengubah status item')
    }
  }

  const handleQuantityChange = async (variantID: string, newQty: number) => {
    if (newQty < 1) return
    try {
      const token = await getAuth().currentUser?.getIdToken(true)
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/cart/quantity`, {
        product_variant_id: variantID,
        quantity: newQty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Jumlah berhasil diperbarui')
      // update local state tanpa fetch ulang
      setGroupedCart(prev => prev.map(seller => ({
        ...seller,
        products: seller.products.map(product => ({
          ...product,
          cart_items: product.cart_items.map(item =>
            item.product_variant_id === variantID ? { ...item, quantity: newQty } : item
          )
        }))
      })))
    } catch {
      toast.error('Gagal mengubah jumlah')
    }
  }

  const selectedItems = groupedCart
    .flatMap(group => group.products.flatMap(p => p.cart_items))
    .filter(item => item.is_selected)

  if (loading) return <p>Loading keranjang...</p>

  return (
  <div className="checkout-container">
    <h2 className="checkout-header">Keranjang Saya</h2>

    {groupedCart.length === 0 ? (
      <p style={{ textAlign: 'center', color: '#888' }}>Keranjang kosong.</p>
    ) : (
      groupedCart.map((group, idx) => (
        <div key={group.seller_name + idx} className="checkout-seller">
          <h3>Penjual: {group.seller_name}</h3>

          {group.products.map((product) => (
            <div key={product.product_name}>
              <p style={{ fontWeight: '600', color: '#3AAFA9', margin: '8px 0' }}>{product.product_name}</p>

              {product.cart_items.map((item) => (
                <div key={item.product_variant_id} className="checkout-item">
                  <input
                    type="checkbox"
                    checked={item.is_selected}
                    onChange={(e) =>
                      handleSelectChange(item.product_variant_id, e.target.checked)
                    }
                    style={{ marginTop: '30px' }}
                  />
                  <img
                    src={item.image_url || '/default-product.jpg'}
                    alt={item.product_variant_name}
                  />
                  <div className="checkout-item-details">
                    <Link href={`/product/${item.product_slug}/variant/${item.product_variant_slug}`}>
                      <p style={{ fontWeight: '600', color: '#22372B' }}>
                        {item.product_name} - {item.product_variant_name}
                      </p>
                    </Link>
                    <div className="quantity-control" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.product_variant_id, item.quantity - 1)
                        }
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #8FCFBC',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.product_variant_id, item.quantity + 1)
                        }
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #8FCFBC',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>
                      Ditambahkan: {new Date(item.added_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))
    )}

    {selectedItems.length > 0 && (
      <div className="checkout-buttons">
        <button onClick={() => router.push('/dashboard/checkout')}>
          Checkout ({selectedItems.length} item)
        </button>
      </div>
    )}
  </div>
)

}
