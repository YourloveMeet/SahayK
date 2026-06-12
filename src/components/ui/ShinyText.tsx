'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export function ShinyText({ 
  text, 
  className = '', 
  speed = 2.5,
  delay = 0,
}: ShinyTextProps) {
  return (
    <motion.span
      className={`inline-block text-transparent bg-clip-text bg-[linear-gradient(110deg,#71717a,45%,#ffffff,55%,#71717a)] bg-[length:250%_100%] ${className}`}
      initial={{ backgroundPosition: "100% 50%" }}
      animate={{ backgroundPosition: "0% 50%" }}
      transition={{
        duration: speed,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        delay: delay,
      }}
    >
      {text}
    </motion.span>
  );
}
