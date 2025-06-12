'use client'

import { useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import './Header.css'

export default function Header({ banners }: { banners: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const id = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)
    return () => clearInterval(id)
  }, [emblaApi])

  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('id-ID', options)
  }

  if (banners.length === 0) return null

  return (
    <div className="header">
      {banners.length > 1 && (
        <button className="slider-button left" onClick={scrollPrev}>
          <FaChevronLeft />
        </button>
      )}

      <div className="slider-container embla" ref={emblaRef}>
        <div className="embla__container">
          {banners.map((banner) => (
            <div className="embla__slide" key={banner.id}>
              <a
                href={`/discount/${banner.slug}`}
                className="header-banner-link"
                aria-label={banner.name}
              >
                <img
                  src={banner.image_cover_url}
                  alt={banner.name}
                  className="header-banner-img"
                  draggable={false}
                />
                <div className="header-banner-overlay">
                  <h2 className="banner-name">{banner.name}</h2>
                  <p className="banner-description">{banner.description}</p>
                  <p className="banner-dates">
                    {formatDate(banner.start_at)} - {formatDate(banner.end_at)}
                  </p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <button className="slider-button right" onClick={scrollNext}>
          <FaChevronRight />
        </button>
      )}
    </div>
  )
}
