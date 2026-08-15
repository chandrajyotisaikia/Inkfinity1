import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Phone, ShieldCheck, Loader2 } from 'lucide-react'

const MOCK_OTP = '1234'

export default function ClientLoginModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState('phone') // phone | otp
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const reset = () => {
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
  }

  const handleClose = () => {
    onClose()
    setTimeout(reset, 300)
  }

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    setError('')
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setStep('otp')
    }, 1000)
  }

  const handleVerify = () => {
    if (otp !== MOCK_OTP) {
      setError('Incorrect code. Use 1234 for this demo.')
      return
    }
    setError('')
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      onSuccess?.(phone)
      handleClose()
    }, 800)
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
          className="relative w-full sm:max-w-sm bg-ink-panel border border-ink-line rounded-t-2xl sm:rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-ink-line">
            <div>
              <p className="eyebrow mb-1">Client Login</p>
              <h3 className="font-serif text-xl">
                {step === 'phone' ? 'Welcome Back' : 'Verify It\u2019s You'}
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

          <div className="px-6 py-6">
            {step === 'phone' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 bg-black/40 border border-ink-line rounded-md px-4 py-3 focus-within:border-gold transition-colors">
                    <Phone size={16} className="text-white/30" />
                    <span className="text-white/50 text-sm">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98XXX XXXXX"
                      className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-red-400/80">{error}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="gold-btn w-full flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
                <p className="text-[11px] text-white/30 text-center">
                  We'll text you a one-time code to verify your number.
                </p>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-black/30 border border-ink-line rounded-md px-4 py-3">
                  <ShieldCheck size={16} className="text-gold shrink-0" />
                  <p className="text-xs text-white/50">
                    Code sent to +91 {phone}. Use{' '}
                    <span className="text-gold">1234</span> for this demo.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Enter 4-Digit Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-full bg-black/40 border border-ink-line rounded-md px-4 py-3 text-white placeholder-white/20 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                {error && <p className="text-xs text-red-400/80">{error}</p>}
                <button
                  onClick={handleVerify}
                  disabled={verifying || otp.length < 4}
                  className="gold-btn w-full flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
                <button
                  onClick={() => setStep('phone')}
                  className="text-xs text-white/40 hover:text-gold transition-colors w-full text-center"
                >
                  Change phone number
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
