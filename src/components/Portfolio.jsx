import React from 'react'
import Reveal from './Reveal.jsx'

// First three slots use the strategic local assets; the rest are
// high-quality dummy placeholders (Unsplash source images by tattoo theme).
const GALLERY = [
  { src: '/tattoo-1.jpg', tall: true, style: 'Fine Line' },
  { src: '/tattoo-2.jpg', tall: false, style: 'Blackwork' },
  { src: '/tattoo-3.jpg', tall: true, style: 'Realism' },
  {
    src: 'https://images.unsplash.com/photo-1590246814883-57c511e76523?q=80&w=800&auto=format&fit=crop',
    tall: false,
    style: 'Geometric',
  },
  {
    src: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop',
    tall: true,
    style: 'Japanese',
  },
  {
    src: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800&auto=format&fit=crop',
    tall: false,
    style: 'Minimalist',
  },
  {
    src: 'https://images.unsplash.com/photo-1590246815906-9dad38a4dcbe?q=80&w=800&auto=format&fit=crop',
    tall: true,
    style: 'Traditional',
  },
  {
    src: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop',
    tall: false,
    style: 'Portrait',
  },
  {
    src: 'https://images.unsplash.com/photo-1611502182207-6cbeb47d5bab?q=80&w=800&auto=format&fit=crop',
    tall: true,
    style: 'Script',
  },
]

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative py-28 md:py-36 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow mb-4">Selected Work</p>
          <h2 className="font-serif text-4xl md:text-5xl">
            The <span className="italic text-gold">Portfolio</span>
          </h2>
        </Reveal>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="columns-2 md:columns-3 gap-2 sm:gap-3 [column-fill:_balance]">
          {GALLERY.map((item, i) => (
            <Reveal
              key={item.src + i}
              delay={(i % 3) * 0.08}
              y={20}
              className="mb-2 sm:mb-3 break-inside-avoid"
            >
              <div
                className={`group relative overflow-hidden rounded-sm cursor-pointer ${
                  item.tall ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <img
                  src={item.src}
                  alt={`${item.style} tattoo example`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-[0.55]"
                />
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-xs tracking-widest2 uppercase text-gold border border-gold/40 rounded-full px-3 py-1.5 backdrop-blur-sm bg-black/30">
                    {item.style}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
