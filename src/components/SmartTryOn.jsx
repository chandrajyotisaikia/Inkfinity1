import React, { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RotateCcw, Move } from 'lucide-react'
import Reveal from './Reveal.jsx'

// Transparent dummy tattoo design (inline SVG data URI — a stylized mandala/linework mark)
const DUMMY_TATTOO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23000000' stroke-width='2.5'%3E%3Ccircle cx='100' cy='100' r='70'/%3E%3Ccircle cx='100' cy='100' r='50'/%3E%3Ccircle cx='100' cy='100' r='30'/%3E%3Cg stroke-width='1.5'%3E%3Cpath d='M100 10 L100 190 M10 100 L190 100 M35 35 L165 165 M165 35 L35 165'/%3E%3C/g%3E%3Cg stroke-width='2'%3E%3Ccircle cx='100' cy='30' r='6'/%3E%3Ccircle cx='100' cy='170' r='6'/%3E%3Ccircle cx='30' cy='100' r='6'/%3E%3Ccircle cx='170' cy='100' r='6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

const CANVAS_W = 520
const CANVAS_H = 620

export default function SmartTryOn() {
  const canvasRef = useRef(null)
  const dragState = useRef({ dragging: false, offsetX: 0, offsetY: 0 })

  const [pos, setPos] = useState({ x: 170, y: 220 })
  const [size, setSize] = useState(150)
  const [enhanced, setEnhanced] = useState(false)

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

  const handlePointerDown = (e) => {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragState.current = {
      dragging: true,
      offsetX: clientX - rect.left - pos.x,
      offsetY: clientY - rect.top - pos.y,
    }
  }

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragState.current.dragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const newX = clamp(clientX - rect.left - dragState.current.offsetX, 0, CANVAS_W - size)
      const newY = clamp(clientY - rect.top - dragState.current.offsetY, 0, CANVAS_H - size)
      setPos({ x: newX, y: newY })
    },
    [size],
  )

  const handlePointerUp = () => {
    dragState.current.dragging = false
  }

  const handleReset = () => {
    setPos({ x: 170, y: 220 })
    setSize(150)
    setEnhanced(false)
  }

  return (
    <section id="try-on" className="relative py-28 md:py-36 bg-ink-charcoal">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-4">The Smart Try-On</p>
          <h2 className="font-serif text-4xl md:text-5xl">
            See It On Your Skin. <span className="italic text-gold">Before It's Real.</span>
          </h2>
          <p className="mt-5 text-white/50 font-light">
            Drag and resize the placement, then let our enhancement engine blend
            the ink naturally into your skin tone and texture.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-[1fr_320px] gap-10 items-start">
          {/* Canvas */}
          <Reveal delay={0.1}>
            <div
              ref={canvasRef}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="relative mx-auto rounded-lg overflow-hidden border border-ink-line select-none"
              style={{
                width: '100%',
                maxWidth: CANVAS_W,
                height: CANVAS_H,
                backgroundImage: "url('/try-on-body.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                touchAction: 'none',
              }}
            >
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />

              <div
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                className="absolute cursor-grab active:cursor-grabbing group"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: size,
                  height: size,
                }}
              >
                <img
                  src={DUMMY_TATTOO}
                  alt="Tattoo design preview"
                  draggable={false}
                  className="w-full h-full transition-[filter] duration-500"
                  style={{
                    mixBlendMode: enhanced ? 'multiply' : 'normal',
                    filter: enhanced
                      ? 'contrast(110%) saturate(115%)'
                      : 'contrast(100%) saturate(100%) opacity(0.9)',
                  }}
                />
                {!enhanced && (
                  <div className="absolute inset-0 border-2 border-dashed border-gold/70 rounded-sm pointer-events-none flex items-center justify-center">
                    <Move className="text-gold/70" size={20} />
                  </div>
                )}
              </div>

              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] tracking-wide text-white/70 uppercase">
                {enhanced ? 'Enhanced Preview' : 'Draft Placement'}
              </div>
            </div>
          </Reveal>

          {/* Controls */}
          <Reveal delay={0.25} className="space-y-8">
            <div>
              <label className="flex items-center justify-between text-sm text-white/60 mb-3">
                <span>Design Size</span>
                <span className="text-gold">{size}px</span>
              </label>
              <input
                type="range"
                min={80}
                max={260}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-gold"
              />
            </div>

            <div className="border-t border-ink-line pt-6 space-y-3 text-sm text-white/50 font-light leading-relaxed">
              <p>
                <span className="text-white/80">1.</span> Drag the design anywhere
                on the canvas.
              </p>
              <p>
                <span className="text-white/80">2.</span> Adjust size with the
                slider.
              </p>
              <p>
                <span className="text-white/80">3.</span> Click Enhance to blend
                ink into skin.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setEnhanced(true)}
                className="gold-btn flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Enhance &amp; Apply
              </button>
              <button
                onClick={handleReset}
                className="ghost-btn flex items-center justify-center gap-2 !py-3"
              >
                <RotateCcw size={15} />
                Reset Preview
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
