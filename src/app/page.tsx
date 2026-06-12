'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurText } from '@/components/ui/BlurText';
import { ShinyText } from '@/components/ui/ShinyText';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [introPhase, setIntroPhase] = useState<'line' | 'blur' | 'shiny' | 'split' | 'done'>('line');

  useEffect(() => {
    // Phase 1: Line draws across the screen (0 - 1.5s)
    const t1 = setTimeout(() => setIntroPhase('blur'), 1500);
    
    // Phase 2: BlurText reveals the words (1.5s - 3.0s)
    const t2 = setTimeout(() => setIntroPhase('shiny'), 3000);
    
    // Phase 3: ShinyText shimmers across the text (3.0s - 5.5s)
    const t3 = setTimeout(() => setIntroPhase('split'), 5500);
    
    // Phase 4: Text fades out and curtains split open (5.5s - 7.0s)
    const t4 = setTimeout(() => setIntroPhase('done'), 7000);

    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3); 
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden font-sans">
      
      {/* ----------------- CINEMATIC SPLIT ENTRANCE ----------------- */}
      {introPhase !== 'done' && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col">
          
          {/* Top Curtain */}
          <motion.div 
            initial={{ y: "0%" }}
            animate={introPhase === 'split' ? { y: "-100%" } : { y: "0%" }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }} // Cinematic ease
            className="w-full h-[50vh] bg-[#050505] z-40 relative flex justify-center items-end shadow-2xl"
          >
            {/* The top half of the line */}
            <motion.div 
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              className="w-full h-[1px] bg-white/20 absolute bottom-0 origin-center" 
            />
          </motion.div>
          
          {/* Bottom Curtain */}
          <motion.div 
            initial={{ y: "0%" }}
            animate={introPhase === 'split' ? { y: "100%" } : { y: "0%" }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
            className="w-full h-[50vh] bg-[#050505] z-40 relative flex justify-center items-start shadow-2xl"
          >
            {/* The bottom half of the line */}
            <motion.div 
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              className="w-full h-[1px] bg-white/20 absolute top-0 origin-center" 
            />
          </motion.div>

          {/* Center Intro Text Wrapper (Sits exactly on the middle line) */}
          <AnimatePresence>
            {(introPhase === 'blur' || introPhase === 'shiny') && (
              <motion.div 
                key="intro-pill"
                initial={{ x: "-50%", y: "-50%", scale: 0.85, opacity: 0, filter: "blur(10px)" }}
                animate={{ x: "-50%", y: "-50%", scale: 1.15, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: "-50%", y: "-50%", opacity: 0, scale: 1.25, filter: "blur(10px)", transition: { duration: 0.5, ease: "easeInOut" } }}
                transition={{ duration: 4.0, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 z-50 flex items-center justify-center bg-black px-12 py-6 rounded-full shadow-2xl border border-white/10"
              >
                <div className="relative flex items-center justify-center w-full">
                  {/* Blur Reveal */}
                  <div className={`absolute transition-opacity duration-1000 flex items-center justify-center w-full ${introPhase === 'blur' ? 'opacity-100' : 'opacity-0'}`}>
                    <BlurText 
                      text="Introducing SahayaK" 
                      className="text-2xl md:text-4xl lg:text-5xl font-black tracking-widest text-zinc-500 drop-shadow-2xl text-center whitespace-nowrap"
                      delay={100}
                    />
                  </div>
                  
                  {/* Shiny Shimmer */}
                  <div className={`absolute transition-opacity duration-1000 flex items-center justify-center w-full ${introPhase === 'shiny' ? 'opacity-100' : 'opacity-0'}`}>
                    <ShinyText 
                      text="Introducing SahayaK" 
                      className="text-2xl md:text-4xl lg:text-5xl font-black tracking-widest drop-shadow-2xl text-center whitespace-nowrap"
                      speed={2.5}
                    />
                  </div>
                  
                  {/* Invisible placeholder to maintain width */}
                  <div className="text-2xl md:text-4xl lg:text-5xl font-black tracking-widest text-transparent whitespace-nowrap opacity-0 pointer-events-none">
                    Introducing SahayaK
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      )}
      
      {/* ----------------- ACTUAL LANDING PAGE ----------------- */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-white">
        {/* Background Gradients (Multiply blend mode for white background) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_80%)] pointer-events-none z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          
          {/* Main Content (Triggers when split starts) */}
          <div className="flex flex-col items-center w-full">
            
            {/* Title Cinematic Reveal */}
            <div className="overflow-hidden pb-4">
              <motion.h1 
                initial={{ y: 120, opacity: 0, rotateX: 20 }} 
                animate={introPhase === 'split' || introPhase === 'done' ? { y: 0, opacity: 1, rotateX: 0 } : { y: 120, opacity: 0, rotateX: 20 }} 
                transition={{ duration: 1.4, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 drop-shadow-sm origin-bottom"
              >
                <motion.span
                  className="inline-block text-transparent bg-clip-text bg-[linear-gradient(110deg,#111827,48%,#6b7280,52%,#111827)] bg-[length:250%_100%]"
                  initial={{ backgroundPosition: "100% 50%" }}
                  animate={{ backgroundPosition: "0% 50%" }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                >
                  Welcome to SahayaK
                </motion.span>
              </motion.h1>
            </div>
            
            <motion.p 
              initial={{ y: 50, opacity: 0 }} 
              animate={introPhase === 'split' || introPhase === 'done' ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }} 
              transition={{ duration: 1.4, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="text-lg md:text-xl lg:text-2xl font-medium tracking-wide leading-relaxed text-gray-600 max-w-3xl mx-auto mb-12"
            >
              A hyperlocal volunteer-assistance platform connecting citizens in need with nearby volunteers. 
              <br className="hidden md:block" />
              <span className="text-gray-800 font-bold">Donate time and knowledge instead of money.</span>
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.9 }} 
              animate={introPhase === 'split' || introPhase === 'done' ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.9 }} 
              transition={{ duration: 1.4, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
            >
              {/* Primary Button */}
              <Link 
                href="/register" 
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold text-white transition-all duration-300 rounded-full hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Animated Dark/Silver Background */}
                <motion.div 
                  className="absolute inset-0 bg-[linear-gradient(110deg,#111827,48%,#4b5563,52%,#111827)] bg-[length:250%_100%] z-0"
                  initial={{ backgroundPosition: "100% 50%" }}
                  animate={{ backgroundPosition: "0% 50%" }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              {/* Secondary Button */}
              <Link 
                href="/login" 
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold text-gray-700 transition-all duration-300 rounded-full border border-gray-200 hover:border-gray-300 hover:scale-105 active:scale-95 shadow-sm overflow-hidden"
              >
                {/* Animated Light/Silver Background */}
                <motion.div 
                  className="absolute inset-0 bg-[linear-gradient(110deg,#ffffff,48%,#f3f4f6,52%,#ffffff)] bg-[length:250%_100%] z-0 group-hover:bg-[linear-gradient(110deg,#f9fafb,48%,#e5e7eb,52%,#f9fafb)] transition-colors duration-300"
                  initial={{ backgroundPosition: "100% 50%" }}
                  animate={{ backgroundPosition: "0% 50%" }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: 0.5 }} // Offset delay so they don't shine exactly at the same time
                />
                <span className="relative z-10">Log In</span>
              </Link>
            </motion.div>
          </div>
          
        </div>
        
        {/* Subtle bottom indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={introPhase === 'split' || introPhase === 'done' ? { opacity: 1 } : { opacity: 0 }} 
          transition={{ duration: 2, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-bold tracking-widest uppercase"
        >
          <span className="animate-pulse">Empowering Communities</span>
        </motion.div>

      </div>
    </div>
  );
}
