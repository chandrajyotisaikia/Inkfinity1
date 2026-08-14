import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Hero({ onBookNow }) {
  return (
    <section
      id="top"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="eyebrow mb-6"
        >
          Custom Tattoo Studio &amp; Academy
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className="font-serif text-5xl sm:text-6xl md:text-8xl leading-[1.05] tracking-tight"
        >
          Art That
          <br />
          <span className="italic text-gold">Outlives</span> You.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 text-white/60 text-base md:text-lg max-w-xl mx-auto font-light"
        >
          Bespoke tattoo artistry and a professional academy for the next
          generation of ink masters. Every line, deliberate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={onBookNow} className="gold-btn w-full sm:w-auto">
            Book Your Consultation
          </button>
          <a href="#portfolio" className="ghost-btn w-full sm:w-auto text-center">
            View Portfolio
          </a>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
