import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, CheckCircle2, ShieldCheck } from 'lucide-react'
import Reveal from './Reveal.jsx'

const COURSE_FEE = 50000
const EMI_MONTHS = 5

export default function Academy() {
  const [emiEnabled, setEmiEnabled] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [toast, setToast] = useState(false)

  const monthly = Math.round(COURSE_FEE / EMI_MONTHS)

  const handleAuthenticate = () => {
    setAuthenticating(true)
    setTimeout(() => {
      setAuthenticating(false)
      setToast(true)
      setTimeout(() => setToast(false), 3800)
    }, 1400)
  }

  return (
    <section id="academy" className="relative py-28 md:py-36 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/academy-vibe.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-14 items-start">
          <Reveal>
            <p className="eyebrow mb-4">Inkfinity Academy</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              Learn From Experts.
              <br />
              <span className="italic text-gold">Guaranteed Placement.</span>
            </h2>
            <p className="text-white/55 font-light leading-relaxed mb-8 max-w-md">
              A structured, mentor-led path from first line to studio-ready
              artist. Hands-on machine work, hygiene certification, portfolio
              building, and direct placement support with partner studios.
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                '12-week intensive, small cohort',
                'Real client sessions under supervision',
                'Portfolio & business mentorship',
                'Placement guarantee with partner studios',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-gold mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="bg-ink-panel/90 backdrop-blur border border-ink-line rounded-xl p-7 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <GraduationCap size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest2">
                    Enrollment
                  </p>
                  <p className="font-serif text-lg">Full Course Access</p>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-b border-ink-line pb-5 mb-5">
                <span className="text-white/50 text-sm">Course Fee</span>
                <span className="font-serif text-3xl">₹50,000</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-white/80">5-Month EMI Auto-Deduct</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    ₹{monthly.toLocaleString('en-IN')}/mo · via UPI Autopay
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={emiEnabled}
                  onClick={() => setEmiEnabled((v) => !v)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 ${
                    emiEnabled ? 'bg-gold' : 'bg-ink-line'
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute top-1 w-5 h-5 rounded-full bg-black ${
                      emiEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <AnimatePresence>
                {emiEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 bg-black/40 border border-ink-line rounded-lg p-4 flex items-start gap-3">
                      <ShieldCheck size={16} className="text-gold mt-0.5 shrink-0" />
                      <p className="text-xs text-white/50 leading-relaxed">
                        Your card/UPI will be securely authenticated for {EMI_MONTHS}{' '}
                        automatic deductions of ₹{monthly.toLocaleString('en-IN')}.
                        Cancel anytime from your account.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleAuthenticate}
                disabled={authenticating}
                className="gold-btn w-full mt-6 flex items-center justify-center gap-2"
              >
                {authenticating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                    />
                    Authenticating...
                  </>
                ) : emiEnabled ? (
                  'Authenticate Auto-EMI via UPI'
                ) : (
                  'Pay Full Fee via UPI'
                )}
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] bg-ink-panel border border-gold/40 rounded-lg px-5 py-4 shadow-gold flex items-center gap-3 max-w-sm w-[90%] sm:w-auto"
          >
            <CheckCircle2 size={20} className="text-gold shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">
                Auto-EMI authenticated
              </p>
              <p className="text-xs text-white/50">
                ₹{monthly.toLocaleString('en-IN')}/mo will be auto-deducted for {EMI_MONTHS} months.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
