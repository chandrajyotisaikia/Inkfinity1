import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Hero from './Hero.jsx'
import SmartTryOn from './SmartTryOn.jsx'
import BookingCTA from './BookingCTA.jsx'
import Academy from './Academy.jsx'
import Portfolio from './Portfolio.jsx'
import Footer from './Footer.jsx'
import BookingModal from './BookingModal.jsx'
import ClientLoginModal from './ClientLoginModal.jsx'

export default function Storefront() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const location = useLocation()

  // React Router doesn't auto-scroll to a #hash the way a plain <a> tag
  // does. This handles arriving at "/#booking" etc. from another route
  // (e.g. the waiver page's "Back to studio" / "Book Consultation" links).
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location])

  return (
    <div className="grain min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar onBookNow={() => setBookingOpen(true)} onClientLogin={() => setLoginOpen(true)} />
      <Hero onBookNow={() => setBookingOpen(true)} />
      <SmartTryOn />
      <Portfolio />
      <BookingCTA onBookNow={() => setBookingOpen(true)} />
      <Academy />
      <Footer />

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <ClientLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => setLoginOpen(false)}
      />
    </div>
  )
}
