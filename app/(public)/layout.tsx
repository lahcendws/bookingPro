import Link from 'next/link'
import styles from './public-layout.module.css'

// Using system fonts for offline Docker builds
const fontVariables = {
  style: {
    '--font-bricolage': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    '--font-dm-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  } as React.CSSProperties,
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page} style={fontVariables.style}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navBrand}>
          BookingPro<span>.</span>
        </Link>
        <div className={styles.navRight}>
          <Link href="/login" className={styles.navLink}>
            Sign in
          </Link>
          <Link href="/es/precios" className={`${styles.navLink} lang-switcher`}>
            ES
          </Link>
          <Link href="/register" className={styles.btnNav}>
            Start free
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        {children}
      </main>

      {/* FOOTER — keep in sync with all other pages
          ES standard: /es/ · /es/precios · /es/para · legal · GitHub
          EN standard: / · legal · GitHub */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          BookingPro<span>.</span>
        </div>
        <div className={styles.footerCopy}>© 2026 BookingPro. All rights reserved.</div>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refund policy</Link>
          <a href="https://github.com/SGrappelli/BookingPro" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
