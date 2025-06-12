'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState, useRef } from 'react'
import { FaShoppingCart, FaBell, FaHistory } from 'react-icons/fa'
import AuthButton from '@/components/auth/AuthButton'
import ReactDOM from 'react-dom'
import './Navbar.css'

export default function Navbar({ referenceData }: { referenceData: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState('')

  // State show/hide dropdown & portals
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPortal1, setShowPortal1] = useState(false)
  const [showPortal2, setShowPortal2] = useState(false)
  const [portal1Pos, setPortal1Pos] = useState<{ top: number; left: number } | null>(null)
  const [portal2Pos, setPortal2Pos] = useState<{ top: number; left: number } | null>(null)
  const [hoveredLabel, setHoveredLabel] = useState<number | null>(null)

  const portalRoot = typeof window !== 'undefined' ? document.body : null

  const hideTimeout = useRef<NodeJS.Timeout | null>(null)

  // Bersihkan timeout hide
  const clearHideTimeout = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current)
      hideTimeout.current = null
    }
  }

  // Fungsi hide dropdown & portals dengan delay
  const scheduleHideAll = () => {
    clearHideTimeout()
    hideTimeout.current = setTimeout(() => {
      setShowDropdown(false)
      setShowPortal1(false)
      setShowPortal2(false)
      setHoveredLabel(null)
    }, 250)
  }

  // Fungsi untuk show dropdown dan reset timeout hide
  const cancelHideAll = () => {
    clearHideTimeout()
    setShowDropdown(true)
  }

  // Handler hover utama: wrapper yang membungkus main dropdown + portal1 + portal2
  const onWrapperMouseEnter = () => {
    cancelHideAll()
  }

  const onWrapperMouseLeave = () => {
    scheduleHideAll()
  }

  // Handler untuk Category label mouse enter (portal1)
  const onCategoryLabelMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    cancelHideAll()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPortal1Pos({ top: rect.top, left: rect.right })
    setShowPortal1(true)
  }

  // Handler untuk label hover di portal1 untuk munculin portal2
  const onLabelMouseEnter = (e: React.MouseEvent<HTMLDivElement>, labelId: number) => {
    cancelHideAll()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPortal2Pos({ top: rect.top, left: rect.right })
    setHoveredLabel(labelId)
    setShowPortal2(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?query=${encodeURIComponent(search)}`)
  }

  function handlePortalWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const scrollTop = el.scrollTop
    const scrollHeight = el.scrollHeight
    const clientHeight = el.clientHeight

    const atTop = scrollTop === 0
    const atBottom = scrollHeight - scrollTop <= clientHeight + 1 // tolerance 1px

    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const label = referenceData.category_labels?.find((l: any) => l.id === hoveredLabel)

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link href="/" className="navbar-brand">
          <img src="/tokoaku.png" alt="tokoaku" />
        </Link>
      </div>

      <div className="navbar-center">
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div
          className={`navbar-menu-item-wrapper`}
          onMouseEnter={onWrapperMouseEnter}
          onMouseLeave={onWrapperMouseLeave}
        >
          <div className={`navbar-menu-item ${showDropdown ? 'active' : ''}`}>
            <span>Product ▼</span>

            {showDropdown && (
              <div className="dropdown-content">
                <div>
                  Form ▶
                  <div className="sub-dropdown">
                    {referenceData.product_forms?.map((f: any) => (
                      <Link href={`/form/${f.slug}`} key={f.id}>
                        <span>{f.form}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  Type ▶
                  <div className="sub-dropdown">
                    {referenceData.product_types?.map((t: any) => (
                      <Link href={`/type/${t.slug}`} key={t.id}>
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div
                  onMouseEnter={onCategoryLabelMouseEnter}
                  onWheel={handlePortalWheel}
                >
                  Category ▶
                </div>
              </div>
            )}
          </div>

          {portalRoot &&
            showPortal1 &&
            portal1Pos &&
            ReactDOM.createPortal(
              <div
                className="sub-dropdown-portal"
                style={{ top: `${portal1Pos.top}px`, left: `${portal1Pos.left}px` }}
                onMouseEnter={onWrapperMouseEnter}
                onMouseLeave={onWrapperMouseLeave}
                onWheel={handlePortalWheel}
              >
                {referenceData.category_labels?.map((label: any) => (
                  <div
                    key={label.id}
                    onMouseEnter={(e) => onLabelMouseEnter(e, label.id)}
                  >
                    {label.name} ▶
                  </div>
                ))}
              </div>,
              portalRoot
            )}

          {portalRoot &&
            showPortal2 &&
            portal2Pos &&
            portal1Pos &&
            label &&
            ReactDOM.createPortal(
              <div
                className="sub-dropdown-portal"
                style={{ top: `${portal1Pos.top}px`, left: `${portal2Pos.left}px` }}
                onMouseEnter={onWrapperMouseEnter}
                onMouseLeave={onWrapperMouseLeave}
                onWheel={handlePortalWheel}
              >
                {label.categories?.map((cat: any) => (
                  <Link href={`/category/${label.slug}/${cat.slug}`} key={cat.id}>
                    <div>{cat.name}</div>
                  </Link>
                ))}
              </div>,
              portalRoot
            )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-links">
          <Link href="/dashboard/cart">
            <FaShoppingCart size={20} />
          </Link>
          <Link href="/notifications">
            <FaBell size={20} />
          </Link>
          <Link href="/order-history">
            <FaHistory size={20} />
          </Link>
        </div>
        {!pathname.startsWith('/login') &&
          !pathname.startsWith('/register') &&
          !pathname.startsWith('/verify') && <AuthButton />}
      </div>
    </nav>
  )
}
