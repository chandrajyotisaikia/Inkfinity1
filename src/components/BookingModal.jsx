import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, ChevronLeft, Calendar, Clock, QrCode } from 'lucide-react'

const PLACEMENTS = [
  'Forearm', 'Upper Arm', 'Shoulder', 'Back', 'Chest',
  'Ribs', 'Thigh', 'Calf', 'Neck', 'Hand / Fingers',
]

const TIME_SLOTS = ['11:00 AM', '1:30 PM', '4:00 PM', '6:30 PM']

const emptyForm = {
  placement: '',
  size: '',
  description: '',
  date: '',
  time: '',
}

export default function BookingModal({ open, onClose }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  if (!open) return null

  const reset = () => {
    setStep(1)
    setForm(emptyForm)
    setPaying(false)
    setPaid(false)
  }

  const handleClose = () => {
    onClose()
    setTimeout(reset, 300)
  }

  const canContinueStep1 = form.placement && form.size
  const canContinueStep2 = form.date && form.time

  const handlePay = () => {
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setPaid(true)
    }, 1600)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-0 sm:px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-lg bg-ink-panel border border-ink-line rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-ink-line">
            <div>
              <p className="eyebrow mb-1">Smart Studio Booking</p>
              <h3 className="font-serif text-xl">
                {paid ? 'Consultation Secured' : `Step ${step} of 3`}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-white/50 hover:text-gold transition-colors"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Progress bar */}
          {!paid && (
            <div className="flex gap-1.5 px-6 pt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                    s <= step ? 'bg-gold' : 'bg-ink-line'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="px-6 py-6 overflow-y-auto">
            {paid ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <CheckCircle2 className="mx-auto text-gold mb-5" size={56} strokeWidth={1.5} />
                <p className="text-white/70 font-light mb-1">
                  Your deposit has been received.
                </p>
                <p className="font-serif text-2xl mb-6">
                  {form.date || 'Your date'} · {form.time || 'Your slot'}
                </p>
                <div className="bg-black/40 border border-ink-line rounded-lg p-4 text-left text-sm text-white/60 space-y-1.5">
                  <p><span className="text-white/40">Placement:</span> {form.placement}</p>
                  <p><span className="text-white/40">Size:</span> {form.size}</p>
                  <p><span className="text-white/40">Deposit paid:</span> ₹2,000</p>
                </div>
                <button onClick={handleClose} className="gold-btn w-full mt-8">
                  Done
                </button>
              </motion.div>
            ) : (
              <>
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Placement
                      </label>
                      <select
                        value={form.placement}
                        onChange={(e) => setForm({ ...form, placement: e.target.value })}
                        className="w-full bg-black/40 border border-ink-line rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      >
                        <option value="">Select a body placement</option>
                        {PLACEMENTS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Approximate Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Small (< 3")', 'Medium (3–6")', 'Large (6"+)'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm({ ...form, size: s })}
                            className={`text-xs px-3 py-3 rounded-md border transition-colors ${
                              form.size === s
                                ? 'border-gold text-gold bg-gold/5'
                                : 'border-ink-line text-white/60 hover:border-white/30'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Describe Your Idea
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        placeholder="Style, references, symbolism..."
                        className="w-full bg-black/40 border border-ink-line rounded-md px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
                      />
                    </div>

                    <button
                      disabled={!canContinueStep1}
                      onClick={() => setStep(2)}
                      className="gold-btn w-full"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="flex items-center gap-2 text-sm text-white/60 mb-3">
                        <Calendar size={15} /> Preferred Date
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full bg-black/40 border border-ink-line rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm text-white/60 mb-3">
                        <Clock size={15} /> Preferred Time
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, time: t })}
                            className={`text-sm px-4 py-3 rounded-md border transition-colors ${
                              form.time === t
                                ? 'border-gold text-gold bg-gold/5'
                                : 'border-ink-line text-white/60 hover:border-white/30'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setStep(1)}
                        className="ghost-btn !px-4 flex items-center justify-center"
                        aria-label="Back"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        disabled={!canContinueStep2}
                        onClick={() => setStep(3)}
                        className="gold-btn flex-1"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-black/40 border border-gold/30 rounded-lg p-5">
                      <p className="text-xs uppercase tracking-widest2 text-gold mb-2">
                        Mandatory Security Deposit
                      </p>
                      <p className="font-serif text-3xl mb-2">₹2,000</p>
                      <p className="text-xs text-white/40">
                        Non-refundable · Adjusted against your final tattoo cost
                      </p>
                    </div>

                    <div className="bg-black/20 border border-ink-line rounded-lg p-4 text-sm text-white/60 space-y-1.5">
                      <p><span className="text-white/40">Placement:</span> {form.placement}</p>
                      <p><span className="text-white/40">Size:</span> {form.size}</p>
                      <p><span className="text-white/40">Slot:</span> {form.date} · {form.time}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="ghost-btn !px-4 flex items-center justify-center"
                        aria-label="Back"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={handlePay}
                        disabled={paying}
                        className="gold-btn flex-1 flex items-center justify-center gap-2"
                      >
                        {paying ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                            />
                            Processing UPI...
                          </>
                        ) : (
                          <>
                            <QrCode size={16} />
                            Pay via UPI
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
