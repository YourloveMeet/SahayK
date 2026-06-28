'use client'

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';

export type SwipeTheme = 'blue' | 'purple' | 'orange' | 'green' | 'indigo' | 'gray';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label: string;
  theme?: SwipeTheme;
}

export function SwipeToConfirm({ onConfirm, label, theme = 'indigo' }: SwipeToConfirmProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Background text fades out as you drag
  const textOpacity = useTransform(x, [0, 150], [1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (hasConfirmed) return;
    
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const thumbWidth = 56; // 48px thumb + 8px margin space
    const maxDrag = containerWidth - thumbWidth;

    // Must drag at least 75% of the way across to confirm
    const draggedFarEnough = info.offset.x > maxDrag * 0.75;

    if (draggedFarEnough) {
      setHasConfirmed(true);
      controls.start({ x: maxDrag, transition: { type: 'tween', ease: 'easeOut', duration: 0.2 } });
      toast.success(label.replace('Slide to ', '') + ' confirmed!');
      onConfirm();
    } else {
      // Snap back smoothly if they let go early
      controls.start({ x: 0, transition: { type: 'tween', ease: 'easeOut', duration: 0.3 } });
    }
  };

  const getThemeClasses = () => {
    switch(theme) {
      case 'blue': return { bg: 'bg-blue-600', text: 'text-white', thumbIcon: 'text-blue-600' };
      case 'purple': return { bg: 'bg-purple-600', text: 'text-white', thumbIcon: 'text-purple-600' };
      case 'orange': return { bg: 'bg-orange-600', text: 'text-white', thumbIcon: 'text-orange-600' };
      case 'green': return { bg: 'bg-green-600', text: 'text-white', thumbIcon: 'text-green-600' };
      case 'gray': return { bg: 'bg-gray-900 dark:bg-white', text: 'text-white dark:text-gray-900', thumbIcon: 'text-gray-900 dark:text-black' };
      default: return { bg: 'bg-indigo-600', text: 'text-white', thumbIcon: 'text-indigo-600' };
    }
  };

  const themeClasses = getThemeClasses();
  
  // Simplify label for small screens if it's too long
  const displayLabel = label.replace('Mark as Complete', 'Complete');

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center h-[56px] rounded-full overflow-hidden w-full ${themeClasses.bg} shadow-md mt-4 select-none touch-none`}
    >
      {/* Background Text */}
      <motion.div 
        style={{ opacity: hasConfirmed ? 0 : textOpacity }}
        className="absolute w-full h-full flex items-center justify-center pointer-events-none z-0 px-16"
      >
        <span className={`font-bold text-[14px] md:text-[15px] tracking-wide ${themeClasses.text} whitespace-nowrap`}>
          {displayLabel}
        </span>
      </motion.div>

      {/* Success Text */}
      {hasConfirmed && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute w-full h-full flex items-center justify-center pointer-events-none z-10"
        >
          <span className={`font-bold text-[15px] tracking-wide ${themeClasses.text} whitespace-nowrap flex items-center gap-2`}>
            <Check className="w-5 h-5" /> Confirmed
          </span>
        </motion.div>
      )}

      {/* Draggable Thumb */}
      <motion.div
        drag={hasConfirmed ? false : "x"}
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={`absolute left-1 z-20 w-[48px] h-[48px] bg-white dark:bg-zinc-100 rounded-full shadow-lg flex items-center justify-center ${hasConfirmed ? 'opacity-0 scale-50' : 'cursor-grab active:cursor-grabbing hover:scale-105'} transition-all duration-300`}
      >
        <ChevronRight className={`w-6 h-6 ${themeClasses.thumbIcon}`} />
        <ChevronRight className={`w-6 h-6 -ml-4 ${themeClasses.thumbIcon}`} />
      </motion.div>
    </div>
  );
}
