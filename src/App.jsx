import React, { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import SmartTryOn from './components/SmartTryOn.jsx'
import BookingCTA from './components/BookingCTA.jsx'
import Academy from './components/Academy.jsx'
import Portfolio from './components/Portfolio.jsx'
import Footer from './components/Footer.jsx'
import BookingModal from './components/BookingModal.jsx'

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="grain min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar onBookNow={() => setBookingOpen(true)} />
      <Hero onBookNow={() => setBookingOpen(true)} />
      <SmartTryOn />
      <Portfolio />
      <BookingCTA onBookNow={() => setBookingOpen(true)} />
      <Academy />
      <Footer />

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
