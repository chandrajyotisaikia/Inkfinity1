import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  Sparkles,
  RotateCcw,
  Move,
  Upload,
  Camera,
  Scissors,
  Loader2,
  X,
  RotateCw,
  Maximize2,
  ImageOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Reveal from './Reveal.jsx'

const CANVAS_W = 520
const CANVAS_H = 620

/**
 * ---------------------------------------------------------------------------
 * AI ENHANCE ADAPTER
 * ---------------------------------------------------------------------------
 * True photorealistic compositing (matching perspective, lighting, and skin
 * texture the way a real "AI tattoo preview" tool does) requires an actual
 * image model call — that can't happen purely in client CSS. This function
 * is the single seam where that call belongs.
 *
 * It calls the Anthropic Messages API (POST /v1/messages) the same way this
 * app's own artifact runtime does — no API key is passed client-side since
 * that's handled by the host. If you deploy this SPA outside that runtime,
 * replace the body of this function with a call to your own backend that
 * wraps an image-capable model (this stays a pure static frontend either
 * way — the call target is just a config change).
 *
 * If the call fails or isn't available, we fall back to a strong local
 * canvas-based blend (skin-tone sampling + multiply + lighting match) so the
 * feature never breaks — it just degrades gracefully.
 * ---------------------------------------------------------------------------
 */
async function aiEnhanceComposite({ skinDataUrl }) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'You are assisting a tattoo try-on tool. Given this skin photo, respond ONLY with a JSON object: {"skinTone":"<light|medium|tan|deep>","lightingDirection":"<top|left|right|front>","suggestedOpacity":<0-1 number>,"suggestedContrast":<percent number, e.g. 112>,"suggestedSaturation":<percent number>}. No prose, no markdown fences.',
              },
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: skinDataUrl.split(',')[1] },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) throw new Error('AI enhance endpoint unavailable')
    const data = await response.json()
    const text = data.content?.map((b) => b.text || '').join('') || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return {
      source: 'ai',
      contrast: parsed.suggestedContrast ?? 112,
      saturation: parsed.suggestedSaturation ?? 116,
      opacity: parsed.suggestedOpacity ?? 0.92,
      skinTone: parsed.skinTone ?? 'medium',
    }
  } catch (err) {
    // Graceful local fallback — refined below using an actual luminance
    // sample of the uploaded skin photo.
    return {
      source: 'local-fallback',
      contrast: 112,
      saturation: 116,
      opacity: 0.92,
      skinTone: 'medium',
      error: err?.message,
    }
  }
}

/** Samples the average luminance of an <img> via an offscreen canvas. */
function sampleAverageLuminance(imgEl) {
  try {
    const c = document.createElement('canvas')
    c.width = 32
    c.height = 32
    const ctx = c.getContext('2d')
    ctx.drawImage(imgEl, 0, 0, 32, 32)
    const { data } = ctx.getImageData(0, 0, 32, 32)
    let total = 0
    for (let i = 0; i < data.length; i += 4) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    return total / (data.length / 4) // 0-255
  } catch {
    return 128
  }
}

export default function SmartTryOn() {
  const canvasRef = useRef(null)
  const skinInputRef = useRef(null)
  const tattooInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const skinImgRef = useRef(null)
  const dragState = useRef({ dragging: false })

  // Skin photo (user-provided — camera or upload). No default image.
  const [skinPhoto, setSkinPhoto] = useState(null) // dataURL
  // Tattoo design (user-uploaded). No default image — must upload.
  const [tattooSrc, setTattooSrc] = useState(null) // dataURL, possibly bg-removed
  const [tattooOriginal, setTattooOriginal] = useState(null) // pre-bg-removal, for revert

  const [pos, setPos] = useState({ x: CANVAS_W / 2 - 75, y: CANVAS_H / 2 - 75 })
  const [size, setSize] = useState(150)
  const [rotation, setRotation] = useState(0)
  const [activeTool, setActiveTool] = useState('move') // move | resize | rotate

  const [removingBg, setRemovingBg] = useState(false)
  const [bgRemoved, setBgRemoved] = useState(false)
  const [bgRemovalError, setBgRemovalError] = useState(null)

  const [enhancing, setEnhancing] = useState(false)
  const [enhanced, setEnhanced] = useState(false)
  const [enhanceMeta, setEnhanceMeta] = useState(null)

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

  // ---- File handling -------------------------------------------------

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleSkinUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readFileAsDataUrl(file)
    setSkinPhoto(dataUrl)
    setEnhanced(false)
    setEnhanceMeta(null)
    e.target.value = ''
  }

  const handleTattooUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readFileAsDataUrl(file)
    setTattooSrc(dataUrl)
    setTattooOriginal(dataUrl)
    setBgRemoved(false)
    setBgRemovalError(null)
    setEnhanced(false)
    setEnhanceMeta(null)
    setPos({ x: CANVAS_W / 2 - 75, y: CANVAS_H / 2 - 75 })
    setSize(150)
    setRotation(0)
    e.target.value = ''
  }

  // ---- Background removal (client-side AI model, @imgly/background-removal) ----

  const handleRemoveBackground = async () => {
    if (!tattooSrc) return
    setRemovingBg(true)
    setBgRemovalError(null)
    try {
      // Lazy-loaded so the segmentation model bundle only downloads when used.
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(tattooSrc)
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      setTattooSrc(dataUrl)
      setBgRemoved(true)
    } catch (err) {
      setBgRemovalError(
        'Background removal is unavailable right now. Your design will still apply with its original background.',
      )
    } finally {
      setRemovingBg(false)
    }
  }

  const handleRevertBackground = () => {
    if (tattooOriginal) {
      setTattooSrc(tattooOriginal)
      setBgRemoved(false)
    }
  }

  // ---- Drag / resize / rotate -----------------------------------------

  const handlePointerDown = (e) => {
    if (!tattooSrc || !skinPhoto) return
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    if (activeTool === 'move') {
      dragState.current = {
        dragging: true,
        mode: 'move',
        offsetX: clientX - rect.left - pos.x,
        offsetY: clientY - rect.top - pos.y,
      }
    } else if (activeTool === 'resize') {
      dragState.current = {
        dragging: true,
        mode: 'resize',
        startX: clientX,
        startSize: size,
      }
    } else if (activeTool === 'rotate') {
      const centerX = rect.left + pos.x + size / 2
      const centerY = rect.top + pos.y + size / 2
      dragState.current = {
        dragging: true,
        mode: 'rotate',
        centerX,
        centerY,
        startAngle: Math.atan2(clientY - centerY, clientX - centerX) - (rotation * Math.PI) / 180,
      }
    }
  }

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragState.current.dragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      if (dragState.current.mode === 'move') {
        const newX = clamp(clientX - rect.left - dragState.current.offsetX, 0, CANVAS_W - size)
        const newY = clamp(clientY - rect.top - dragState.current.offsetY, 0, CANVAS_H - size)
        setPos({ x: newX, y: newY })
      } else if (dragState.current.mode === 'resize') {
        const delta = clientX - dragState.current.startX
        const newSize = clamp(dragState.current.startSize + delta, 60, 320)
        setSize(newSize)
      } else if (dragState.current.mode === 'rotate') {
        const angle = Math.atan2(
          clientY - dragState.current.centerY,
          clientX - dragState.current.centerX,
        )
        const deg = ((angle - dragState.current.startAngle) * 180) / Math.PI
        setRotation(Math.round(deg))
      }
    },
    [size],
  )

  const handlePointerUp = () => {
    dragState.current.dragging = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('touchend', handlePointerUp)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [handlePointerMove])

  // ---- Enhance (AI-assisted, with graceful local fallback) -------------

  const handleEnhance = async () => {
    if (!tattooSrc || !skinPhoto) return
    setEnhancing(true)
    try {
      const meta = await aiEnhanceComposite({ skinDataUrl: skinPhoto })

      if (meta.source === 'local-fallback' && skinImgRef.current?.complete) {
        const lum = sampleAverageLuminance(skinImgRef.current)
        meta.contrast = lum < 100 ? 118 : lum > 180 ? 106 : 112
        meta.saturation = lum < 100 ? 122 : 114
      }

      setEnhanceMeta(meta)
      setEnhanced(true)
    } finally {
      setEnhancing(false)
    }
  }

  const handleReset = () => {
    setPos({ x: CANVAS_W / 2 - 75, y: CANVAS_H / 2 - 75 })
    setSize(150)
    setRotation(0)
    setEnhanced(false)
    setEnhanceMeta(null)
  }

  const handleStartOver = () => {
    setSkinPhoto(null)
    setTattooSrc(null)
    setTattooOriginal(null)
    setBgRemoved(false)
    setBgRemovalError(null)
    handleReset()
  }

  const ready = Boolean(skinPhoto && tattooSrc)

  return (
    <section id="try-on" className="relative py-28 md:py-36 bg-ink-charcoal">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow mb-4">The Smart Try-On</p>
          <h2 className="font-serif text-4xl md:text-5xl">
            See It On Your Skin. <span className="italic text-gold">Before It's Real.</span>
          </h2>
          <p className="mt-5 text-white/50 font-light">
            Upload a photo of your skin and your tattoo design, then let our
            enhancement engine blend the ink naturally into your skin tone
            and texture.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-[1fr_320px] gap-10 items-start">
          {/* Canvas */}
          <Reveal delay={0.1}>
            <div
              ref={canvasRef}
              className="relative mx-auto rounded-lg overflow-hidden border border-ink-line select-none bg-black/30"
              style={{
                width: '100%',
                maxWidth: CANVAS_W,
                height: CANVAS_H,
                touchAction: ready && activeTool !== 'move' ? 'none' : undefined,
              }}
            >
              {/* Empty state: no skin photo yet */}
              {!skinPhoto && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center">
                    <Camera size={22} className="text-gold/70" />
                  </div>
                  <p className="text-white/50 text-sm font-light max-w-xs">
                    Start by adding a photo of the skin you want to preview
                    the tattoo on.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="gold-btn !px-4 !py-2.5 text-sm flex items-center justify-center gap-2 flex-1"
                    >
                      <Camera size={15} />
                      Take Photo
                    </button>
                    <button
                      onClick={() => skinInputRef.current?.click()}
                      className="ghost-btn !px-4 !py-2.5 text-sm flex items-center justify-center gap-2 flex-1"
                    >
                      <Upload size={15} />
                      Upload
                    </button>
                  </div>
                </div>
              )}

              {/* Skin photo present */}
              {skinPhoto && (
                <img
                  ref={skinImgRef}
                  src={skinPhoto}
                  alt="Your uploaded skin"
                  className="absolute inset-0 w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              )}
              {skinPhoto && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}

              {/* Skin present, no tattoo yet */}
              {skinPhoto && !tattooSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-black/40 backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full border border-gold/30 flex items-center justify-center">
                    <ImageOff size={22} className="text-gold/70" />
                  </div>
                  <p className="text-white/60 text-sm font-light max-w-xs">
                    Now upload the tattoo design you want to preview.
                  </p>
                  <button
                    onClick={() => tattooInputRef.current?.click()}
                    className="gold-btn !px-5 !py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <Upload size={15} />
                    Upload Tattoo Design
                  </button>
                </div>
              )}

              {/* Tattoo overlay */}
              {skinPhoto && tattooSrc && (
                <div
                  onMouseDown={handlePointerDown}
                  onTouchStart={handlePointerDown}
                  className={`absolute group ${
                    activeTool === 'move'
                      ? 'cursor-grab active:cursor-grabbing'
                      : activeTool === 'resize'
                        ? 'cursor-ew-resize'
                        : 'cursor-alias'
                  }`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: size,
                    height: size,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    src={tattooSrc}
                    alt="Tattoo design preview"
                    draggable={false}
                    className="w-full h-full object-contain transition-[filter,opacity] duration-500"
                    style={{
                      mixBlendMode: enhanced ? 'multiply' : 'normal',
                      opacity: enhanced ? enhanceMeta?.opacity ?? 0.92 : 0.9,
                      filter: enhanced
                        ? `contrast(${enhanceMeta?.contrast ?? 112}%) saturate(${enhanceMeta?.saturation ?? 116}%)`
                        : 'contrast(100%) saturate(100%)',
                    }}
                  />
                  {!enhanced && (
                    <div className="absolute inset-0 border-2 border-dashed border-gold/70 rounded-sm pointer-events-none flex items-center justify-center">
                      {activeTool === 'move' && <Move className="text-gold/70" size={20} />}
                      {activeTool === 'resize' && <Maximize2 className="text-gold/70" size={20} />}
                      {activeTool === 'rotate' && <RotateCw className="text-gold/70" size={20} />}
                    </div>
                  )}
                </div>
              )}

              {ready && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] tracking-wide text-white/70 uppercase">
                  {enhanced ? 'AI-Enhanced Preview' : 'Draft Placement'}
                </div>
              )}

              {ready && (
                <button
                  onClick={handleStartOver}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-full text-white/60 hover:text-gold transition-colors"
                  aria-label="Start over"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Hidden file inputs */}
            <input
              ref={skinInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSkinUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleSkinUpload}
            />
            <input
              ref={tattooInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleTattooUpload}
            />

            {/* Placement toolbar */}
            {ready && (
              <div className="flex gap-2 mt-4 max-w-[520px] mx-auto">
                {[
                  { id: 'move', label: 'Move', icon: Move },
                  { id: 'resize', label: 'Size', icon: Maximize2 },
                  { id: 'rotate', label: 'Rotate', icon: RotateCw },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-md border text-xs tracking-wide transition-colors ${
                      activeTool === t.id
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-ink-line text-white/50 hover:border-white/30'
                    }`}
                  >
                    <t.icon size={16} />
                    {t.label.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={handleReset}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-md border border-ink-line text-white/50 hover:border-white/30 text-xs tracking-wide transition-colors"
                >
                  <RotateCcw size={16} />
                  RESET
                </button>
              </div>
            )}
          </Reveal>

          {/* Controls */}
          <Reveal delay={0.25} className="space-y-6">
            {skinPhoto && (
              <div className="flex gap-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="ghost-btn !py-2.5 text-xs flex items-center justify-center gap-1.5 flex-1"
                >
                  <Camera size={13} /> Retake
                </button>
                <button
                  onClick={() => skinInputRef.current?.click()}
                  className="ghost-btn !py-2.5 text-xs flex items-center justify-center gap-1.5 flex-1"
                >
                  <Upload size={13} /> Replace
                </button>
              </div>
            )}

            {skinPhoto && tattooSrc && (
              <div className="border-t border-ink-line pt-5 space-y-3">
                <p className="text-xs uppercase tracking-widest2 text-white/40">
                  Tattoo Design
                </p>
                <button
                  onClick={() => tattooInputRef.current?.click()}
                  className="ghost-btn w-full !py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Upload size={13} /> Replace Design
                </button>

                <button
                  onClick={bgRemoved ? handleRevertBackground : handleRemoveBackground}
                  disabled={removingBg}
                  className="w-full !py-2.5 text-xs rounded-sm border border-gold/40 text-gold flex items-center justify-center gap-1.5 transition-colors hover:bg-gold/5 disabled:opacity-50"
                >
                  {removingBg ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Removing background...
                    </>
                  ) : bgRemoved ? (
                    <>
                      <RotateCcw size={13} />
                      Revert Background
                    </>
                  ) : (
                    <>
                      <Scissors size={13} />
                      Remove Background
                    </>
                  )}
                </button>

                {bgRemoved && !removingBg && (
                  <p className="flex items-center gap-1.5 text-[11px] text-gold/80">
                    <CheckCircle2 size={12} /> Background removed
                  </p>
                )}
                {bgRemovalError && (
                  <p className="flex items-start gap-1.5 text-[11px] text-white/40">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                    {bgRemovalError}
                  </p>
                )}
              </div>
            )}

            {ready && (
              <div className="border-t border-ink-line pt-5">
                <label className="flex items-center justify-between text-sm text-white/60 mb-3">
                  <span>Design Size</span>
                  <span className="text-gold">{size}px</span>
                </label>
                <input
                  type="range"
                  min={60}
                  max={320}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-gold"
                />
              </div>
            )}

            <div className="border-t border-ink-line pt-6 space-y-3 text-sm text-white/50 font-light leading-relaxed">
              <p><span className="text-white/80">1.</span> Add a photo of your skin.</p>
              <p><span className="text-white/80">2.</span> Upload your tattoo design.</p>
              <p><span className="text-white/80">3.</span> Remove its background if needed.</p>
              <p><span className="text-white/80">4.</span> Position, then Enhance.</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleEnhance}
                disabled={!ready || enhancing}
                className="gold-btn flex items-center justify-center gap-2"
              >
                {enhancing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Enhance &amp; Apply
                  </>
                )}
              </button>
              {enhanced && enhanceMeta?.source === 'local-fallback' && (
                <p className="text-[11px] text-white/35 text-center">
                  Enhanced using local blend — AI service unavailable.
                </p>
              )}
              <button
                onClick={handleStartOver}
                disabled={!skinPhoto && !tattooSrc}
                className="ghost-btn flex items-center justify-center gap-2 !py-3 disabled:opacity-30"
              >
                <X size={15} />
                Start Over
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
