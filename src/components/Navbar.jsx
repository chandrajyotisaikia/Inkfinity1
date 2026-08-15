import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, User } from 'lucide-react'

const LINKS = [
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Try-On', href: '#try-on' },
  { label: 'Academy', href: '#academy' },
  { label: 'Studio', href: '#booking' },
]

export default function Navbar({ onBookNow, onClientLogin }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/70 backdrop-blur-xl border-b border-ink-line'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-5">
        <a href="#top" className="font-serif text-xl md:text-2xl tracking-wide">
          INK<span className="text-gold">FINITY</span>
        </a>

        <div className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide text-white/70 hover:text-gold transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {onClientLogin && (
            <button
              onClick={onClientLogin}
              className="flex items-center gap-1.5 text-sm tracking-wide text-white/70 hover:text-gold transition-colors duration-300"
            >
              <User size={15} />
              Client Login
            </button>
          )}
          <button onClick={onBookNow} className="gold-btn !px-6 !py-2.5 text-sm">
            Book Consultation
          </button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-black/95 backdrop-blur-xl border-t border-ink-line px-6 py-6 flex flex-col gap-5"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/80 hover:text-gold text-base"
            >
              {l.label}
            </a>
          ))}
          {onClientLogin && (
            <button
              onClick={() => {
                setMobileOpen(false)
                onClientLogin()
              }}
              className="flex items-center gap-2 text-white/80 hover:text-gold text-base text-left"
            >
              <User size={17} />
              Client Login
            </button>
          )}
          <button
            onClick={() => {
              setMobileOpen(false)
              onBookNow()
            }}
            className="gold-btn w-full text-center"
          >
            Book Consultation
          </button>
        </motion.div>
      )}
    </motion.header>
  )
}
