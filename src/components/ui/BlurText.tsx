'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: 'words' | 'letters';
  onAnimationComplete?: () => void;
}

export function BlurText({
  text,
  className = '',
  delay = 100, // Ms per word/letter
  animateBy = 'words',
  onAnimationComplete
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <div ref={ref} className={`flex flex-nowrap ${className}`}>
      {elements.map((element, index) => {
        const isLast = index === elements.length - 1;
        return (
          <motion.span
            key={index}
            initial={{ filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0, 8px, 0)' }}
            animate={isInView ? { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0, 0px, 0)' } : {}}
            transition={{
              duration: 0.6,
              delay: index * (delay / 1000),
              ease: 'easeOut',
            }}
            onAnimationComplete={isLast ? onAnimationComplete : undefined}
            className="inline-block"
          >
            {element === ' ' ? '\u00A0' : element}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </div>
  );
}
