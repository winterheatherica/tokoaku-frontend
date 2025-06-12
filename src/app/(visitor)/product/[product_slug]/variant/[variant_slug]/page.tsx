'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuth } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import Link from 'next/link'
import './page.css'

interface VariantImage {
  image_url: string
  is_variant_cover: boolean
}

interface Discount {
  id: number
  name: string
  value: number
  value_type: string
  sponsor?: string
}

interface Variant {
  id: string
  name: string
  slug: string
  stock: number
  original_price?: number
  final_price?: number
  discounts?: Discount[]
  images: VariantImage[]
}

interface Product {
  id: string
  name: string
  description: string
  image_cover_url: string
  product_type: { name: string }
  product_form: { form: string }
  slug: string
}

interface AllVariant {
  id: string
  variant_name: string
  slug: string
  created_at: string
}

export default function VisitorProductDetailPage() {
  const { product_slug, variant_slug } = useParams<{ product_slug: string, variant_slug: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [variant, setVariant] = useState<Variant | null>(null)
  const [allVariantsRaw, setAllVariantsRaw] = useState<AllVariant[]>([])
  const [quantity, setQuantity] = useState<number>(1)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewText, setReviewText] = useState('')
  const [reviewSentiment, setSentiment] = useState('')
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [canReview, setCanReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [eligibleVariants, setEligibleVariants] = useState<{ id: string, variant_name: string }[]>([])
  const [selectedVariantID, setSelectedVariantID] = useState<string | null>(null)

  const allVariants = useMemo(() => {
    return allVariantsRaw.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [allVariantsRaw])

  useEffect(() => {
    setLoading(true)
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/product/${product_slug}/variant/${variant_slug}`)
      .then((res) => {
        const productData = res.data.product
        const variantData = res.data.variant
        const allVariants = res.data.all_variants
        if (!productData || !variantData) throw new Error("Data tidak lengkap")
        setProduct(productData)
        setVariant({
          ...variantData,
          discounts: variantData.discounts?.map((d: any) => ({
            id: d.id,
            name: d.name,
            value: typeof d.value === 'object' ? d.value.value : d.value,
            value_type: typeof d.value_type === 'object' ? d.value_type.name : d.value_type,
            sponsor: d.sponsor
          })) ?? [],
          images: variantData.images ?? []
        })
        setAllVariantsRaw(allVariants)
      })
      .catch(() => {
        setProduct(null)
        setVariant(null)
      })
      .finally(() => setLoading(false))
  }, [product_slug, variant_slug])

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/reviews/${product_slug}`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
  }, [product_slug])

  useEffect(() => {
    const check = async () => {
      const user = getAuth().currentUser
      if (!user) return
      const token = await user.getIdToken()
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/review/check/${product_slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setCanReview(res.data.can_review)
        setReviewMessage(res.data.message)
        setEligibleVariants(res.data.eligible_variants)
      }).catch(() => setCanReview(false))
    }
    check()
  }, [product_slug])

  const handleAddToCart = async () => {
    const user = getAuth().currentUser
    if (!user) return router.push('/login')
    const token = await user.getIdToken()
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/cart`, {
      product_variant_id: variant?.id,
      quantity
    }, { headers: { Authorization: `Bearer ${token}` } }).then(() => {
      toast.success('Produk ditambahkan ke keranjang!')
    }).catch(() => {
      toast.error('Gagal menambahkan ke keranjang')
    })
  }

  const handleSubmitReview = async () => {
    const user = getAuth().currentUser
    if (!user) return router.push('/login')
    const token = await user.getIdToken()
    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/review`, {
      product_variant_id: selectedVariantID,
      text: reviewText,
      label: reviewSentiment,
      rating: reviewRating
    }, { headers: { Authorization: `Bearer ${token}` } })
    console.log(reviews)
    toast.success('Review berhasil dikirim!')
    setReviewText('')
    setReviewRating(5)
    setSelectedVariantID(null)
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/visitor/reviews/${product_slug}`)
    setReviews(res.data)
  }

  if (loading) return <p>Loading...</p>
  if (!product || !variant) return <p>Produk atau varian tidak ditemukan.</p>

  return (
    <div className="product-page">
      <div className="product-main">
        <div className="product-main-left">
          <h1 className="product-title">{product.name}</h1>
          <img src={product.image_cover_url} alt={product.name} className="product-main-image" />
          {variant.images.length > 0 && (
          <div className="product-variant-thumbnails">
            {variant.images.map((img, i) => (
              <img
                key={i}
                src={img.image_url}
                alt={`Thumbnail ${i}`}
                className={`thumbnail ${img.is_variant_cover ? 'cover' : ''}`}
              />
            ))}
          </div>
        )}
        </div>
        <div className="product-main-right">
          <h2 className="variant-name">{variant.name}</h2>
          <p className="variant-description">{product.description}</p>
          <p>Type: {product.product_type?.name}</p>
          <p>Form: {product.product_form?.form}</p>
          <p>Stock: {variant.stock}</p>
          <p>
            {variant.discounts && variant.discounts.length > 0 ? (
              <>
                <span className="original-price">Rp{variant.original_price?.toLocaleString('id-ID')}</span>
                <span className="final-price"> Rp{variant.final_price?.toLocaleString('id-ID')}</span>
              </>
            ) : (
              <span className="final-price">Rp{variant.original_price?.toLocaleString('id-ID')}</span>
            )}
          </p>
          {variant.discounts && variant.discounts.length > 0 && (
            <div className="discount-section">
              <h4>Discount Available</h4>
              <ul>
                {variant.discounts.map((d) => (
                  <li key={d.id}>
                    {d.name}{' '}
                    {d.value_type === 'Percentage'
                      ? `(${d.value}%)`
                      : `(Rp ${d.value.toLocaleString('id-ID')})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="variant-selector">
            {allVariants && allVariants.length > 1 && (
              <div className="variant-selector">
                <h4>Select Variant</h4>
                <div className="variant-buttons-container">
                  {allVariants.map(v => (
                    <Link
                      key={v.id}
                      href={`/product/${product.slug}/variant/${v.slug}`}
                      className={`variant-button ${v.slug === variant.slug ? 'active' : ''}`}
                    >
                      {v.variant_name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="add-to-cart">
            <label className="quantity-label">
              Quantity:
              <input type="number" value={quantity} min={1} onChange={e => setQuantity(+e.target.value)} />
            </label>
            <button onClick={handleAddToCart}>Add</button>
          </div>
        </div>
      </div>

      <div className="product-reviews">
        <h3>Reviews</h3>
        {canReview && (
          <div className="review-form">
            <h4>Select the variant you want to review</h4>
            <div className="variant-review-buttons">
              {eligibleVariants?.length > 0 ? (
                eligibleVariants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantID(v.id)}
                    className={selectedVariantID === v.id ? 'selected' : ''}
                  >
                    {v.variant_name}
                  </button>
                ))
              ) : (
                <p>Tidak ada varian yang memenuhi syarat review.</p>
              )}
            </div>
            {selectedVariantID && (
              <>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Tulis reviewmu..."
                />
                <div className="review-input-section">
                  <label>
                    Rating:{' '}
                    <select
                      value={reviewRating}
                      onChange={e => setReviewRating(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                  <button onClick={handleSubmitReview}>Kirim Review</button>
                </div>
              </>
            )}
          </div>
        )}
        <div className="all-reviews">
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((r, i) => (
              <div key={i} className="review-item">
                <p>
                  <strong>{r.customer?.name ?? 'User'}</strong> • {r.rating}⭐{' '}
                  {r.label && <span className="review-sentiment">{r.label}</span>}
                </p>
                <p>{r.variant_name && `Variant: ${r.variant_name}`}</p>
                <div className="review-text-row">
                  <p className="review-text">{r.text}</p>
                  <p className="review-date">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Belum ada review.</p>
          )}
        </div>
      </div>
    </div>
  )
}
