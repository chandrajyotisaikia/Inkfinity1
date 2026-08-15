import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Upload,
  Eraser,
  CheckCircle2,
  ArrowLeft,
  Lock,
  FileCheck2,
} from 'lucide-react'
import Navbar from './Navbar.jsx'
import ClientLoginModal from './ClientLoginModal.jsx'
import Toast from './Toast.jsx'

const MEDICAL_QUESTIONS = [
  { id: 'pregnant', label: 'Are you currently pregnant or breastfeeding?' },
  { id: 'bloodThinner', label: 'Are you taking any blood-thinning medication?' },
  { id: 'allergies', label: 'Do you have any known skin allergies or sensitivities?' },
  { id: 'bloodDisorder', label: 'Do you have a history of hemophilia or other blood disorders?' },
  { id: 'skinCondition', label: 'Do you have any active skin conditions (eczema, psoriasis, infection)?' },
  { id: 'alcoholDrugs', label: 'Have you consumed alcohol or recreational drugs in the last 24 hours?' },
]

export default function ConsentForm() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const hasSignature = useRef(false)

  const [loggedInPhone, setLoggedInPhone] = useState(null)
  const [loginOpen, setLoginOpen] = useState(false)

  const [answers, setAnswers] = useState({})
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [idUploaded, setIdUploaded] = useState(false)
  const [idFileName, setIdFileName] = useState('')
  const [signaturePresent, setSignaturePresent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(false)
  const idInputRef = useRef(null)

  // Prompt login immediately if not logged in
  useEffect(() => {
    if (!loggedInPhone) setLoginOpen(true)
  }, [loggedInPhone])

  // ---- Signature canvas ----
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#D4AF37'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [loggedInPhone])

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    isDrawing.current = true
    const { x, y } = getCoords(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const { x, y } = getCoords(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
    if (!hasSignature.current) {
      hasSignature.current = true
      setSignaturePresent(true)
    }
  }

  const stopDraw = () => {
    isDrawing.current = false
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasSignature.current = false
    setSignaturePresent(false)
  }

  const handleIdUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIdUploaded(true)
    setIdFileName(file.name)
  }

  const toggleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const allQuestionsAnswered = MEDICAL_QUESTIONS.every((q) => answers[q.id] !== undefined)
  const canSubmit = allQuestionsAnswered && ageConfirmed && idUploaded && signaturePresent

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setToast(true)
      setTimeout(() => setToast(false), 4000)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onBookNow={() => navigate('/#booking')} />

      <ClientLoginModal
        open={loginOpen && !loggedInPhone}
        onClose={() => {
          setLoginOpen(false)
          if (!loggedInPhone) navigate('/')
        }}
        onSuccess={(phone) => setLoggedInPhone(phone)}
      />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm mb-8"
          >
            <ArrowLeft size={15} />
            Back to studio
          </button>

          {!loggedInPhone ? (
            <div className="text-center py-24 text-white/30 text-sm">
              Please log in to continue to the waiver.
            </div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <FileCheck2 className="mx-auto text-gold mb-6" size={56} strokeWidth={1.5} />
              <h2 className="font-serif text-3xl mb-3">Waiver Submitted</h2>
              <p className="text-white/50 font-light max-w-sm mx-auto mb-8">
                Your digital waiver has been securely saved. Your artist will
                review it before your session.
              </p>
              <button onClick={() => navigate('/')} className="gold-btn">
                Return to Studio
              </button>
            </motion.div>
          ) : (
            <>
              <p className="eyebrow mb-4">Client Portal</p>
              <h1 className="font-serif text-4xl md:text-5xl mb-3">
                Digital <span className="italic text-gold">Waiver</span>
              </h1>
              <p className="text-white/50 font-light mb-10">
                Logged in as +91 {loggedInPhone}. This mandatory waiver must
                be completed before your session begins.
              </p>

              {/* Age verification */}
              <section className="mb-10 pb-10 border-b border-ink-line">
                <h2 className="text-xs uppercase tracking-widest2 text-gold mb-4">
                  Age Verification
                </h2>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-gold shrink-0"
                  />
                  <span className="text-sm text-white/70">
                    I confirm that I am 18 years of age or older, or I have a
                    legal guardian present who consents on my behalf.
                  </span>
                </label>
              </section>

              {/* Medical history */}
              <section className="mb-10 pb-10 border-b border-ink-line">
                <h2 className="text-xs uppercase tracking-widest2 text-gold mb-5">
                  Medical History
                </h2>
                <div className="space-y-5">
                  {MEDICAL_QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <p className="text-sm text-white/70 mb-2.5">{q.label}</p>
                      <div className="flex gap-2">
                        {['Yes', 'No'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleAnswer(q.id, opt)}
                            className={`px-5 py-2 rounded-md border text-xs tracking-wide transition-colors ${
                              answers[q.id] === opt
                                ? 'border-gold text-gold bg-gold/5'
                                : 'border-ink-line text-white/50 hover:border-white/30'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ID upload */}
              <section className="mb-10 pb-10 border-b border-ink-line">
                <h2 className="text-xs uppercase tracking-widest2 text-gold mb-4">
                  Identity Verification
                </h2>
                <input
                  ref={idInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleIdUpload}
                />
                <button
                  onClick={() => idInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-md border text-sm transition-colors ${
                    idUploaded
                      ? 'border-gold/40 text-gold bg-gold/5'
                      : 'border-dashed border-ink-line text-white/50 hover:border-white/30'
                  }`}
                >
                  {idUploaded ? (
                    <>
                      <CheckCircle2 size={16} />
                      {idFileName}
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Government ID
                    </>
                  )}
                </button>
              </section>

              {/* Signature */}
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-widest2 text-gold">
                    Signature
                  </h2>
                  <button
                    onClick={clearSignature}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-gold transition-colors"
                  >
                    <Eraser size={13} />
                    Clear
                  </button>
                </div>
                <div className="relative bg-black/40 border border-ink-line rounded-md overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={180}
                    className="w-full h-[180px] touch-none cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  {!signaturePresent && (
                    <p className="absolute inset-0 flex items-center justify-center text-white/20 text-sm font-light pointer-events-none">
                      Draw your signature here
                    </p>
                  )}
                </div>
              </section>

              <div className="flex items-start gap-2.5 mb-6 text-[11px] text-white/35">
                <Lock size={13} className="mt-0.5 shrink-0" />
                <p>
                  Your information is stored in our encrypted studio vault
                  and is only accessible to your assigned artist and studio
                  management.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="gold-btn w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <ShieldCheck size={16} className="animate-pulse" />
                    Securing waiver...
                  </>
                ) : (
                  'Submit Waiver'
                )}
              </button>
              {!canSubmit && (
                <p className="text-[11px] text-white/30 text-center mt-3">
                  Complete all sections above to submit.
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <Toast
        show={toast}
        title="Waiver securely saved to studio encrypted vault."
        message="Your artist will review it before your appointment."
      />
    </div>
  )
}
