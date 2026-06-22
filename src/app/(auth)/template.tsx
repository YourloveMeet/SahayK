'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // The landing page has its own custom cinematic intro sequence, so we bypass it here.
  // The auth pages and dashboard pages will get this smooth page transition.
  if (pathname === '/') {
    return <>{children}</>
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1.0], // smooth ease-out curve
      }}
      className="flex flex-col flex-1 w-full h-full min-h-screen"
    >
      {children}
    </motion.div>
  )
}
