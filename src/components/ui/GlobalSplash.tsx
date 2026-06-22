'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DominosLoader } from '@/components/ui/Loaders'
import { usePathname } from 'next/navigation'

export function GlobalSplash() {
  const [show, setShow] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [phrases, setPhrases] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    // Prevent splash screen from covering the public landing page or auth pages
    if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return
    }

    const isFreshLogin = sessionStorage.getItem('is_fresh_login') === 'true'
    const notSeenYet = !sessionStorage.getItem('sahayak_splash_seen')

    // Show the cinematic splash if it's their first time entering the app this session, OR if they just logged in
    if (notSeenYet || isFreshLogin) {
      let currentPhrases = ["Initializing SahayaK...", "Almost there..."]
      let duration = 5000

      if (isFreshLogin) {
        currentPhrases = [
          "Verifying Credentials...",
          "Fetching Profile Data...",
          "Initializing SahayaK...",
          "Almost there..."
        ]
        duration = 10000 // 10 seconds for 4 phrases
        sessionStorage.removeItem('is_fresh_login') // consume the flag
      }

      setPhrases(currentPhrases)
      setShow(true)
      setIsExiting(false) // Reset exit state in case it triggers again
      
      // Start exit animation after the duration
      const timer = setTimeout(() => {
        setIsExiting(true)
        sessionStorage.setItem('sahayak_splash_seen', 'true')
        
        // Remove from DOM completely after fade out
        setTimeout(() => setShow(false), 1000)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [pathname]) // Re-evaluate whenever the route changes (e.g. redirected from login)

  if (!show) return null

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed z-[99999] bg-[#0A0A0A] flex flex-col items-center justify-center pointer-events-auto"
          style={{ top: '-20px', left: '-20px', right: '-20px', bottom: '-100px' }}
        >
          <DominosLoader />
          
          <div className="relative h-10 mt-16 flex items-center justify-center w-full">
            {phrases.map((phrase, i) => (
              <h2 
                key={i}
                className="absolute text-xl md:text-2xl font-black tracking-tighter phrase-fade"
                style={{ animationDelay: `${i * 2.5}s` }}
              >
                <span className="metallic-text">{phrase}</span>
              </h2>
            ))}
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes simpleFade {
              0% { opacity: 0; }
              5%, 45% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
            .phrase-fade {
              opacity: 0;
              animation: simpleFade 5s forwards;
            }
            @keyframes metallicShine {
              0% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .metallic-text {
              background: linear-gradient(110deg, #71717a 45%, #ffffff 55%, #71717a);
              background-size: 250% 100%;
              -webkit-background-clip: text;
              color: transparent;
              animation: metallicShine 2.5s linear infinite;
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
