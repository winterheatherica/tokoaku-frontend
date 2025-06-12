'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import './page.css'

interface DiscountDTO {
    id: number
    name: string
    value: number
    value_type: string
    sponsor?: string
}

interface PreviewCartItem {
    product_variant_id: string
    product_name: string
    variant_name: string
    quantity: number
    image_url: string
    variant_images: string[]
    added_at: string
    original_price?: number
    final_price?: number
    subtotal: number
    discounts?: DiscountDTO[]
}

interface SellerShippingOption {
    shipping_option_id: number
    courier_name: string
    courier_service_name: string
    fee: number
    estimated_time: string
    service_type: string
}

interface PreviewGroupedCart {
    seller_name: string
    seller_id: string
    cart_items: PreviewCartItem[]
    transfer_fee: number
    shipping_options: SellerShippingOption[]
    bank_account_id: string
    platform_fee: number
}

interface Promo {
    id: number
    name: string
    code: string
    description: string
    value: number
    value_type: string | { name: string }
    min_price_value: number
    max_value: number
    start_at: string
    end_at: string
}

interface PaymentMethod {
    id: number
    name: string
}

export default function CheckoutPage() {
    const [checkoutItems, setCheckoutItems] = useState<PreviewGroupedCart[]>([])
    const [selectedShipping, setSelectedShipping] = useState<Record<string, number>>({})
    const [promos, setPromos] = useState<Promo[]>([])
    const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null)
    const [activeAddress, setActiveAddress] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [totalPlatformFee, setTotalPlatformFee] = useState<number>(0)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchCheckoutPreview()
        fetchActiveAddress()
    }, [])

    const fetchCheckoutPreview = async () => {
        try {
            const token = await getAuth().currentUser?.getIdToken(true)
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/checkout/preview`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setCheckoutItems(res.data.items || [])
            setPromos(res.data.promos || [])
            setPaymentMethods(res.data.payment_methods || [])
            setTotalPlatformFee(res.data.total?.platform_fee || 0)
        } catch (err) {
            console.error('❌ Gagal mengambil preview checkout:', err)
            toast.error('Gagal memuat data checkout')
        } finally {
            setLoading(false)
        }
    }

    const fetchActiveAddress = async () => {
        try {
            const token = await getAuth().currentUser?.getIdToken(true)
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/address`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const active = res.data.address
            if (active) setActiveAddress(active)
            else toast.error('Alamat aktif tidak ditemukan.')
        } catch (err) {
            console.error('❌ Gagal mengambil alamat:', err)
            toast.error('Gagal mengambil alamat.')
        }
    }

    const handleSelectShipping = (sellerID: string, optionID: number) => {
        setSelectedShipping(prev => ({ ...prev, [sellerID]: optionID }))
        setOpenDropdown(null)
    }

    const handleSelectPromo = (promoId: number | null) => {
        setSelectedPromoId(promoId)
        setOpenDropdown(null)
    }

    const handleSelectPaymentMethod = (methodId: number) => {
        setSelectedPaymentMethodId(methodId)
        setOpenDropdown(null)
    }

    const totalSubtotal = checkoutItems.reduce((acc, group) => acc + group.cart_items.reduce((s, item) => s + item.subtotal, 0), 0)
    const totalTransferFee = checkoutItems.reduce((acc, group) => acc + group.transfer_fee, 0)
    const totalSelectedShipping = checkoutItems.reduce((acc, group) => {
        const selectedID = selectedShipping[group.seller_id]
        const selected = group.shipping_options.find(opt => opt.shipping_option_id === selectedID)
        return acc + (selected?.fee || 0)
    }, 0)

    let promoDiscount = 0
    if (selectedPromoId) {
        const promo = promos.find(p => p.id === selectedPromoId)
        if (promo && totalSubtotal >= promo.min_price_value) {
            let valueType = typeof promo.value_type === 'string' ? promo.value_type.toLowerCase()
                : (promo.value_type as any)?.name?.toLowerCase()
            if (valueType.includes('percentage')) {
                const rawDiscount = Math.floor((totalSubtotal * promo.value) / 100)
                promoDiscount = promo.max_value > 0 ? Math.min(rawDiscount, promo.max_value) : rawDiscount
            } else if (valueType.includes('flat')) {
                promoDiscount = promo.value
            }
        }
    }

    const grandTotal = totalSubtotal + totalTransferFee + totalSelectedShipping + totalPlatformFee - promoDiscount

    const handleSubmitOrder = async () => {
        if (!selectedPaymentMethodId) {
            toast.error('Pilih metode pembayaran terlebih dahulu.')
            return
        }
        if (!activeAddress) {
            toast.error('Alamat aktif belum dimuat atau tidak ditemukan.')
            return
        }
        const token = await getAuth().currentUser?.getIdToken(true)
        if (!token) {
            toast.error('Gagal mengambil token autentikasi.')
            return
        }
        try {
            const orderShippings = checkoutItems.map(group => ({
                seller_id: group.seller_id,
                shipping_option_id: selectedShipping[group.seller_id],
                bank_account_id: group.bank_account_id,
            }))
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/order/create`, {
                payment_method_id: selectedPaymentMethodId,
                address_id: activeAddress.id,
                promo_id: selectedPromoId,
                order_shippings: orderShippings,
            }, { headers: { Authorization: `Bearer ${token}` } })
            router.push(`/dashboard/order/${res.data.order_id}`)
            toast.success('Pesanan berhasil dibuat!')
        } catch (err) {
            console.error('❌ Gagal membuat pesanan:', err)
            toast.error('Gagal membuat pesanan.')
        }
    }

    if (loading) return <p>Memuat checkout...</p>

    return (
        <div className="checkout-container">
            <h2 className="checkout-header">Ringkasan Checkout</h2>
            {checkoutItems.length === 0 ? (
                <p>Tidak ada item yang dipilih.</p>
            ) : (
                checkoutItems.map((group, idx) => (
                    <div key={idx} className="checkout-seller">
                        <h3>Penjual: {group.seller_name}</h3>
                        {group.cart_items.map(item => (
                            <div key={item.product_variant_id} className="checkout-item">
                                <img src={item.image_url || '/default-product.jpg'} alt={item.variant_name} />
                                <div className="checkout-item-details">
                                    <p><strong>{item.product_name} - {item.variant_name}</strong></p>
                                    <p>Jumlah: {item.quantity}</p>
                                    <p style={{ textAlign: 'right' }}>Subtotal: Rp{item.subtotal.toLocaleString('id-ID')}</p>
                                    {item.discounts && item.discounts.length > 0 && (
                                    <ul>
                                        {item.discounts.map(d => (
                                        <li key={d.id}>
                                            {d.name} ({d.value_type === 'percentage' ? `${d.value}%` : `Rp${d.value.toLocaleString('id-ID')}`})
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                        <p style={{ textAlign: 'right' }}>Biaya Transfer: Rp{group.transfer_fee.toLocaleString('id-ID')}</p>
                        <p style={{ textAlign: 'right' }}>Platform Fee: Rp{group.platform_fee.toLocaleString('id-ID')}</p>

                        {group.shipping_options.length > 0 && (
                            <div className="dropdown-wrapper">
                                <span
                                    className="dropdown-button"
                                    onClick={() => setOpenDropdown(openDropdown === `shipping-${group.seller_id}` ? null : `shipping-${group.seller_id}`)}
                                >
                                    {selectedShipping[group.seller_id]
                                        ? group.shipping_options.find(opt => opt.shipping_option_id === selectedShipping[group.seller_id])?.courier_name +
                                          ' - ' + group.shipping_options.find(opt => opt.shipping_option_id === selectedShipping[group.seller_id])?.courier_service_name
                                        : '-- Pilih Opsi --'}
                                </span>
                                {openDropdown === `shipping-${group.seller_id}` && (
                                    <div className="dropdown-content">
                                        {group.shipping_options.map(opt => (
                                            <div key={opt.shipping_option_id} onClick={() => handleSelectShipping(group.seller_id, opt.shipping_option_id)}>
                                                {opt.courier_name} - {opt.courier_service_name} (Rp{opt.fee.toLocaleString('id-ID')})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}

            <div className="checkout-summary">
                <h4>Pilih Promo</h4>
                <div className="dropdown-wrapper">
                    <span
                        className="dropdown-button"
                        onClick={() => setOpenDropdown(openDropdown === 'promo' ? null : 'promo')}
                    >
                        {selectedPromoId
                            ? promos.find(p => p.id === selectedPromoId)?.name + ' (' + promos.find(p => p.id === selectedPromoId)?.code + ')'
                            : '-- Pilih Promo --'}
                    </span>
                    {openDropdown === 'promo' && (
                        <div className="dropdown-content">
                            <div onClick={() => handleSelectPromo(null)}>❌ Batal Pilih Promo</div>
                            {promos.map(p => (
                                <div key={p.id} onClick={() => handleSelectPromo(p.id)}>
                                    {p.name} ({p.code})
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <h4>Metode Pembayaran</h4>
                <div className="dropdown-wrapper">
                    <span
                        className="dropdown-button"
                        onClick={() => setOpenDropdown(openDropdown === 'payment' ? null : 'payment')}
                    >
                        {selectedPaymentMethodId
                            ? paymentMethods.find(pm => pm.id === selectedPaymentMethodId)?.name
                            : '-- Pilih Metode --'}
                    </span>
                    {openDropdown === 'payment' && (
                        <div className="dropdown-content">
                            {paymentMethods.map(pm => (
                                <div key={pm.id} onClick={() => handleSelectPaymentMethod(pm.id)}>
                                    {pm.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <h4 style={{ textAlign: 'right' }}>Ringkasan Total</h4>
                <p style={{ textAlign: 'right' }}>Subtotal: Rp{totalSubtotal.toLocaleString('id-ID')}</p>
                <p style={{ textAlign: 'right' }}>Transfer Fee: Rp{totalTransferFee.toLocaleString('id-ID')}</p>
                <p style={{ textAlign: 'right' }}>Shipping Fee: Rp{totalSelectedShipping.toLocaleString('id-ID')}</p>
                <p style={{ textAlign: 'right' }}>Total Platform Fee: Rp{totalPlatformFee.toLocaleString('id-ID')}</p>
                {promoDiscount > 0 && <p style={{ textAlign: 'right', color: 'green' }}>Diskon Promo: -Rp{promoDiscount.toLocaleString('id-ID')}</p>}
                <h4 style={{ textAlign: 'right' }}>Grand Total: Rp{grandTotal.toLocaleString('id-ID')}</h4>
            </div>

            <div className="checkout-buttons">
                <button onClick={handleSubmitOrder}>Lanjutkan Pembayaran</button>
            </div>
        </div>
    )
}
