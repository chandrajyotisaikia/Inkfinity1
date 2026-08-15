import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-ink-line pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-3 gap-10 mb-14">
          <div>
            <p className="font-serif text-2xl mb-3">
              INK<span className="text-gold">FINITY</span>
            </p>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
              Premium custom tattoo studio and artist academy. Art that
              outlives you.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest2 text-white/40 mb-4">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><a href="#portfolio" className="hover:text-gold transition-colors">Portfolio</a></li>
              <li><a href="#try-on" className="hover:text-gold transition-colors">Smart Try-On</a></li>
              <li><a href="#academy" className="hover:text-gold transition-colors">Academy</a></li>
              <li><a href="#booking" className="hover:text-gold transition-colors">Book a Session</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest2 text-white/40 mb-4">
              Studio
            </p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-gold/70" />
                Guwahati, Assam
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold/70" />
                studio@inkfinity.art
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={14} className="text-gold/70" />
                @inkfinity.studio
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-line pt-8 text-center">
          <p className="text-white/35 text-xs sm:text-sm tracking-wide">
            Copyright © 2026 Chandrajyoti Saikia. All Rights Reserved. Engineered for Inkfinity.
          </p>
          <Link
            to="/admin"
            className="inline-block mt-3 text-[11px] text-white/20 hover:text-gold/60 transition-colors tracking-wide"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
