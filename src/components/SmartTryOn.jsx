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
 * PICSART API CONFIG
 * ---------------------------------------------------------------------------
 * SECURITY NOTE: this key ships inside the client bundle, so anyone who
 * opens devtools can read it and make calls against your Picsart account
 * and credit balance. This tradeoff was chosen explicitly to avoid standing
 * up a backend. If usage/costs become a problem later, the fix is a thin
 * serverless proxy that holds the key server-side — everything else in this
 * file stays the same, only the fetch URLs below would point at your proxy
 * instead of api.picsart.io directly.
 * ---------------------------------------------------------------------------
 */
const PICSART_API_KEY = 'YOUR_PICSART_API_KEY' // <-- replace with your real key
const PICSART_BASE = 'https://api.picsart.io/tools/1.0'

/** Converts a dataURL into a File object Picsart's multipart API accepts. */
function dataUrlToFile(dataUrl, filename) {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
  const byteString = atob(base64)
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }
  return new File([bytes], filename, { type: mimeType })
}

/** Reads a Blob/File into a data: URL string. */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Removes the background of an image using Picsart's /removebg endpoint.
 * Verified against Picsart's published OpenAPI schema: multipart/form-data,
 * field `image` (binary), auth header `X-Picsart-API-Key`, JSON response
 * shaped `{ data: { url }, status }`.
 */
async function picsartRemoveBackground(dataUrl) {
  const file = dataUrlToFile(dataUrl, 'tattoo.png')
  const form = new FormData()
  form.append('image', file)
  form.append('output_type', 'cutout')
  form.append('format', 'PNG')

  const response = await fetch(`${PICSART_BASE}/removebg`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'X-Picsart-API-Key': PICSART_API_KEY,
    },
    body: form,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Picsart removebg failed (${response.status}): ${detail.slice(0, 200)}`)
  }

  const json = await response.json()
  const resultUrl = json?.data?.url
  if (!resultUrl) throw new Error('Picsart removebg returned no result URL')

  // Fetch the hosted result back into a data URL so it survives in local state
  // without depending on Picsart's CDN staying reachable for the rest of the session.
  const resultBlob = await fetch(resultUrl).then((r) => r.blob())
  return blobToDataUrl(resultBlob)
}

/**
 * Composites the tattoo onto the skin photo using Picsart's /blend endpoint.
 * Verified against Picsart's published OpenAPI schema: multipart/form-data,
 * fields `image` (base), `overlay_image` (binary), `opacity` (0-100),
 * `blend_mode` (enum incl. "multiply"), `format`. Response shaped like removebg.
 *
 * Blend has no x/y/size/rotation params of its own — it overlays at full
 * canvas registration. So the tattoo is first pre-rendered client-side (at
 * its current position/size/rotation) onto a transparent layer the exact
 * pixel dimensions of the skin photo, and that flattened layer is what gets
 * sent as overlay_image.
 */
async function picsartBlend({ skinDataUrl, overlayDataUrl, opacityPercent = 90 }) {
  const [skinFile, overlayFile] = await Promise.all([
    dataUrlToFile(skinDataUrl, 'skin.jpg'),
    dataUrlToFile(overlayDataUrl, 'overlay.png'),
  ])

  const form = new FormData()
  form.append('image', skinFile)
  form.append('overlay_image', overlayFile)
  form.append('opacity', String(Math.round(opacityPercent)))
  form.append('blend_mode', 'multiply')
  form.append('format', 'PNG')

  const response = await fetch(`${PICSART_BASE}/blend`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'X-Picsart-API-Key': PICSART_API_KEY,
    },
    body: form,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Picsart blend failed (${response.status}): ${detail.slice(0, 200)}`)
  }

  const json = await response.json()
  const resultUrl = json?.data?.url
  if (!resultUrl) throw new Error('Picsart blend returned no result URL')

  const resultBlob = await fetch(resultUrl).then((r) => r.blob())
  return blobToDataUrl(resultBlob)
}

/**
 * Renders the tattoo image onto a transparent canvas at the exact pixel
 * dimensions of the skin photo, positioned/sized/rotated to match what the
 * user placed on screen — i.e. flattens the on-screen overlay into a single
 * PNG suitable for Picsart's /blend `overlay_image` parameter.
 *
 * displayScale converts on-screen CSS pixel coordinates (against the
 * CANVAS_W x CANVAS_H preview box) into the skin photo's native pixel
 * dimensions, since the photo is rendered with object-cover and may differ
 * in native resolution and aspect ratio from the preview box.
 */
function renderOverlayToNativeCanvas({ skinImgEl, tattooImgEl, pos, size, rotation }) {
  const nativeW = skinImgEl.naturalWidth
  const nativeH = skinImgEl.naturalHeight

  // object-cover math: figure out the crop/scale the browser applied so we
  // can map preview-box coordinates back to native photo coordinates.
  const boxRatio = CANVAS_W / CANVAS_H
  const imgRatio = nativeW / nativeH
  let scale, offsetX, offsetY
  if (imgRatio > boxRatio) {
    // photo is wider than box: box height matches, width is cropped
    scale = nativeH / CANVAS_H
    offsetX = (nativeW - CANVAS_W * scale) / 2
    offsetY = 0
  } else {
    // photo is taller than box: box width matches, height is cropped
    scale = nativeW / CANVAS_W
    offsetX = 0
    offsetY = (nativeH - CANVAS_H * scale) / 2
  }

  const canvas = document.createElement('canvas')
  canvas.width = nativeW
  canvas.height = nativeH
  const ctx = canvas.getContext('2d')

  const nativeX = pos.x * scale + offsetX
  const nativeY = pos.y * scale + offsetY
  const nativeSize = size * scale

  ctx.save()
  ctx.translate(nativeX + nativeSize / 2, nativeY + nativeSize / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(tattooImgEl, -nativeSize / 2, -nativeSize / 2, nativeSize, nativeSize)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

/** Loads an <img> element from a dataURL/URL, resolving once it's decoded. */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
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
  const [enhancedResult, setEnhancedResult] = useState(null) // dataURL of the Picsart /blend result
  const [enhanceError, setEnhanceError] = useState(null)

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
    setEnhancedResult(null)
    setEnhanceError(null)
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
    setEnhancedResult(null)
    setEnhanceError(null)
    setPos({ x: CANVAS_W / 2 - 75, y: CANVAS_H / 2 - 75 })
    setSize(150)
    setRotation(0)
    e.target.value = ''
  }

  // ---- Background removal (Picsart /removebg — fast, hosted) ----

  const handleRemoveBackground = async () => {
    if (!tattooSrc) return
    setRemovingBg(true)
    setBgRemovalError(null)
    try {
      const dataUrl = await picsartRemoveBackground(tattooSrc)
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

  // ---- Enhance (real compositing via Picsart /blend) --------------------

  const handleEnhance = async () => {
    if (!tattooSrc || !skinPhoto || !skinImgRef.current) return
    if (!skinImgRef.current.complete || skinImgRef.current.naturalWidth === 0) {
      setEnhanceError('Your photo is still loading — please wait a moment and try again.')
      return
    }
    setEnhancing(true)
    setEnhanceError(null)
    try {
      const tattooImgEl = await loadImage(tattooSrc)
      const overlayDataUrl = renderOverlayToNativeCanvas({
        skinImgEl: skinImgRef.current,
        tattooImgEl,
        pos,
        size,
        rotation,
      })

      const blendedDataUrl = await picsartBlend({
        skinDataUrl: skinPhoto,
        overlayDataUrl,
        opacityPercent: 88,
      })

      setEnhancedResult(blendedDataUrl)
      setEnhanced(true)
    } catch (err) {
      setEnhanceError(
        'Enhance is unavailable right now — showing your draft placement instead. Please try again in a moment.',
      )
    } finally {
      setEnhancing(false)
    }
  }

  const handleReset = () => {
    setPos({ x: CANVAS_W / 2 - 75, y: CANVAS_H / 2 - 75 })
    setSize(150)
    setRotation(0)
    setEnhanced(false)
    setEnhancedResult(null)
    setEnhanceError(null)
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

              {/* Draggable draft overlay — hidden once the real enhanced result is showing */}
              {skinPhoto && tattooSrc && !enhanced && (
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
                    className="w-full h-full object-contain opacity-90"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-gold/70 rounded-sm pointer-events-none flex items-center justify-center">
                    {activeTool === 'move' && <Move className="text-gold/70" size={20} />}
                    {activeTool === 'resize' && <Maximize2 className="text-gold/70" size={20} />}
                    {activeTool === 'rotate' && <RotateCw className="text-gold/70" size={20} />}
                  </div>
                </div>
              )}

              {/* Real AI-blended result from Picsart /blend, once available */}
              {enhanced && enhancedResult && (
                <img
                  src={enhancedResult}
                  alt="AI-enhanced tattoo preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
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

            {/* Placement toolbar — editing tools only make sense pre-enhance */}
            {ready && (
              <div className="flex gap-2 mt-4 max-w-[520px] mx-auto">
                {!enhanced &&
                  [
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
                  {enhanced ? 'EDIT PLACEMENT' : 'RESET'}
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
                disabled={!ready || enhancing || enhanced}
                className="gold-btn flex items-center justify-center gap-2"
              >
                {enhancing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enhancing...
                  </>
                ) : enhanced ? (
                  <>
                    <CheckCircle2 size={16} />
                    Enhanced
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Enhance &amp; Apply
                  </>
                )}
              </button>
              {enhanceError && (
                <p className="flex items-start gap-1.5 text-[11px] text-white/40">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  {enhanceError}
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
