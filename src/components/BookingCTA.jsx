import React from 'react'
import { MessageCircleOff, CalendarCheck } from 'lucide-react'
import Reveal from './Reveal.jsx'

export default function BookingCTA({ onBookNow }) {
  return (
    <section id="booking" className="relative py-28 md:py-32 bg-ink-charcoal border-y border-ink-line">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest2 mb-6">
            <MessageCircleOff size={14} />
            No more back-and-forth DMs
          </div>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Skip the Wait. <span className="italic text-gold">Book Direct.</span>
          </h2>
          <p className="text-white/50 font-light max-w-xl mx-auto mb-10">
            Our Smart Studio flow gets you a confirmed slot with your artist in
            under two minutes — no waiting on a reply.
          </p>
          <button
            onClick={onBookNow}
            className="gold-btn inline-flex items-center gap-2"
          >
            <CalendarCheck size={17} />
            Start Your Booking
          </button>
        </Reveal>
      </div>
    </section>
  )
}
