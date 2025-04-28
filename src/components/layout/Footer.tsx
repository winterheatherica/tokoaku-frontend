export default function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.
    </footer>
  )
}
