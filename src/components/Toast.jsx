import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ show, title, message }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-8 left-1/2 z-[300] bg-ink-panel border border-gold/40 rounded-lg px-5 py-4 shadow-gold flex items-center gap-3 max-w-sm w-[90%] sm:w-auto"
        >
          <CheckCircle2 size={20} className="text-gold shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            {message && <p className="text-xs text-white/50">{message}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
