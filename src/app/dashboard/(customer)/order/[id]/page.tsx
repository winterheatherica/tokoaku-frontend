'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { getAuth } from 'firebase/auth'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import './page.css'

interface Discount {
  id: number
  name: string
  value: number
  value_type: string
  sponsor?: string
}

interface PriceInfo {
  product_variant_id: string
  original_price: number
  final_price: number
  discounts: Discount[]
}

interface OrderItemWrapper {
  item: {
    product_variant_id: string
    quantity: number
  }
  price: PriceInfo
  subtotal: number
  image_url: string
}

interface Shipping {
  seller: { name?: string }
  shipping: any
  statuses: any[]
  items: OrderItemWrapper[]
  transfer_fee: number
  shipping_fee: number
  platform_fee: number
}

interface OrderData {
  order: any
  order_logs: any[]
  promo: any
  order_shippings: Shipping[]
  last_status: number
  checkout_summary: {
    total: {
      subtotal: number
      transfer_fee: number
      shipping_fee: number
      platform_fee: number
      promo_discount: number
      grand_total: number
    }
    payment_methods: any[]
  }
}

export default function Page() {
  const { id: orderId } = useParams() as { id: string }
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchOrderDetail = useCallback(async () => {
    try {
      const token = await getAuth().currentUser?.getIdToken(true)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrderData(res.data)
      console.log("Fetched orderData:", res.data)
    } catch (err) {
      console.error('Gagal mengambil detail order:', err)
      toast.error('Gagal mengambil detail order.')
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) fetchOrderDetail()
  }, [fetchOrderDetail, orderId])

  const handlePayment = async () => {
    setLoading(true)
    try {
      const token = await getAuth().currentUser?.getIdToken(true)
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/purchase/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Pembayaran berhasil. Silakan cek status order Anda.')
      fetchOrderDetail()
    } catch (error) {
      console.error('Gagal melakukan pembayaran:', error)
      toast.error('Pembayaran gagal, silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (!orderData) return <p>Memuat detail order...</p>

  const {
    order,
    order_logs,
    promo,
    order_shippings,
    last_status,
    checkout_summary,
  } = orderData

  const total = checkout_summary?.total || {
    subtotal: 0,
    transfer_fee: 0,
    shipping_fee: 0,
    platform_fee: 0,
    promo_discount: 0,
    grand_total: 0,
  }

  return (
    <div className="checkout-container">
      <h2 className="checkout-header">Detail Order</h2>

      <p><strong>ID Order:</strong> {order?.id}</p>
      <p><strong>Alamat:</strong> {order?.address?.address_line ?? '-'}, {order?.address?.city ?? '-'}</p>
      <p><strong>Metode Pembayaran:</strong> {order?.payment_method?.name ?? '-'}</p>
      <p><strong>Total Harga Order (DB):</strong> Rp{order?.total_price?.toLocaleString('id-ID') ?? '0'}</p>

      {promo && <p><strong>Promo Digunakan:</strong> {promo.name}</p>}

      {last_status === 11 && (
        <div className="checkout-buttons">
          <button onClick={handlePayment} disabled={loading}>
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      )}
      {last_status === 12 && (
        <p style={{ color: 'green' }}>✅ Order sudah dibayar.</p>
      )}

      <h3>Log Status</h3>
      <ul className="order-logs-list">
        {order_logs.map((log, idx) => (
          <li key={idx}>{log?.Status?.name ?? ''} Pada {log?.created_at}</li>
        ))}
      </ul>

      <h3>Detail Pengiriman</h3>
      {order_shippings.map((ship, idx) => (
        <section key={idx} className="checkout-seller">
          <h3>Seller: {ship.seller?.name ?? '-'}</h3>
          <p>No. Resi: {ship.shipping?.tracking_number ?? '-'}</p>
          <p>Transfer Fee: Rp{ship.transfer_fee.toLocaleString('id-ID')}</p>
          <p>Shipping Fee: Rp{ship.shipping_fee.toLocaleString('id-ID')}</p>
          <p>Platform Fee: Rp{ship.platform_fee.toLocaleString('id-ID')}</p>

          <h4>Item</h4>
          {ship.items.map((itemWrapper, i) => (
            <div key={i} className="checkout-item">
              <img
                src={itemWrapper.image_url || '/default-product.jpg'}
                alt="Product"
                className="product-image"
              />
              <div className="checkout-item-details">
                <p>Variant ID: {itemWrapper.item.product_variant_id}</p>
                <p>Jumlah: {itemWrapper.item.quantity}</p>
                <p>Harga Asli: Rp{itemWrapper.price.original_price.toLocaleString('id-ID')}</p>
                <p>Harga Setelah Diskon: Rp{itemWrapper.price.final_price.toLocaleString('id-ID')}</p>
                <p><strong>Total: Rp{itemWrapper.subtotal.toLocaleString('id-ID')}</strong></p>

                {itemWrapper.price.discounts.length > 0 && (
                  <ul>
                    {itemWrapper.price.discounts.map((d, di) => (
                      <li key={di}>
                        Diskon {d.name}: {d.value}{d.value_type === 'percentage' ? '%' : ' Rupiah'}
                        {d.sponsor ? ` (oleh ${d.sponsor})` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </section>
      ))}

      <section className="checkout-summary">
        <h4>Ringkasan Checkout</h4>
        <p>Subtotal: Rp{total.subtotal.toLocaleString('id-ID')}</p>
        <p>Transfer Fee: Rp{total.transfer_fee.toLocaleString('id-ID')}</p>
        <p>Shipping Fee: Rp{total.shipping_fee.toLocaleString('id-ID')}</p>
        <p>Platform Fee: Rp{total.platform_fee.toLocaleString('id-ID')}</p>
        <p>Diskon Promo: -Rp{total.promo_discount.toLocaleString('id-ID')}</p>
        <h4>Grand Total: Rp{total.grand_total.toLocaleString('id-ID')}</h4>
      </section>
    </div>
  )
}
