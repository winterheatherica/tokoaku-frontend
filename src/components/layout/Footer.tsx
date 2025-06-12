import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-nav">
        <a href="/about">Tentang Kami</a>
        <a href="/faq">FAQ</a>
        <a href="/contact">Kontak</a>
        <a href="/terms">Syarat</a>
        <a href="/privacy">Privasi</a>
      </div>
      <div className="footer-socials">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.
      </p>
    </footer>
  )
}
