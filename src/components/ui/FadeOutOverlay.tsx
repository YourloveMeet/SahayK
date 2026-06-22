'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function FadeOutOverlay() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="fixed z-[9999] bg-[#0A0A0A] pointer-events-none"
          style={{ top: '-20px', left: '-20px', right: '-20px', bottom: '-100px' }}
        />
      )}
    </AnimatePresence>
  )
}
