'use client'

import './HighlightedProduct.css'

export default function HighlightedProduct({ data }: { data: any }) {
  const { product, prices, discounts, images } = data

  const formatPrice = (price: number | null) => {
    if (price == null) return 'Rp0'
    return `Rp${price.toLocaleString('id-ID')}`
  }

  const variantImages = images.slice(1).sort(() => 0.5 - Math.random()).slice(0, 3)

  const variants = data.variants ?? []
  const randomVariant = variants.length > 0
    ? variants[Math.floor(Math.random() * variants.length)]
    : { slug: '' }

  const hrefLink = `/product/${product.slug}/variant/${randomVariant.slug}`

  return (
    <div className="highlighted-container">
      <div className="highlighted-wrapper">
        <a href={hrefLink} className="highlighted-wrapper-link">
          <div className="highlighted-item">
            <div className="highlighted-left">
              <img
                src={product.image_cover_url || '/default-product.jpg'}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/default-product.jpg'
                }}
              />
            </div>

            <div className="highlighted-middle">
              <div className="highlighted-variant-images">
                {variantImages.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url || '/default-product.jpg'}
                    alt={`Varian ${index}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/default-product.jpg'
                    }}
                  />
                ))}
              </div>
              <div className="highlighted-details">
                <h3>{product.name}</h3>
                <p>Original Price: {formatPrice(prices.min_original)} - {formatPrice(prices.max_original)}</p>
                <p>Discount Price: {formatPrice(prices.min_discount)} - {formatPrice(prices.max_discount)}</p>
                {Array.isArray(discounts) && discounts.length > 0 ? (
                  <div className="discounts-list">
                    <h4>Discount available:</h4>  
                    <ul>
                      {discounts.map((disc: any, index: number) => (
                        <li key={disc.id}>
                          {disc.name}{' '}
                          {disc.value_type === 'Percentage'
                            ? `(${disc.value}%)`
                            : `(Rp ${disc.value.toLocaleString('id-ID')})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Tidak ada diskon aktif.</p>
                )}
              </div>
            </div>
          </div>
        </a>

        <div className="highlighted-erika-wrapper">
          <img src="/erika_spotlight.png" alt="Erika" className="highlighted-erika" />
        </div>
      </div>
    </div>
  )
}
