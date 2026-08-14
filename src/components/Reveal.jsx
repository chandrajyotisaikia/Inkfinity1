import React from 'react'
import { motion } from 'framer-motion'

export default function Reveal({
  children,
  delay = 0,
  y = 32,
  className = '',
  as = 'div',
}) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </Comp>
  )
}
