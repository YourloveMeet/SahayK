'use client'

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label: string;
  isFinalStep?: boolean;
}

export function SwipeToConfirm({ onConfirm, label, isFinalStep }: SwipeToConfirmProps) {
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

    // High sensitivity: if dragged past 50% or swiped fast enough
    const draggedFarEnough = info.offset.x > maxDrag * 0.5;
    const draggedFastEnough = info.velocity.x > 400;

    if (draggedFarEnough || draggedFastEnough) {
      setHasConfirmed(true);
      controls.start({ x: maxDrag, transition: { type: 'spring', stiffness: 400, damping: 25 } });
      onConfirm();
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
    }
  };

  const baseBg = isFinalStep ? 'bg-gray-900 dark:bg-white' : 'bg-indigo-600';
  const textColor = isFinalStep ? 'text-white dark:text-gray-900' : 'text-white';
  const thumbIconColor = isFinalStep ? 'text-gray-900 dark:text-black' : 'text-indigo-600';

  // Simplify label for small screens if it's too long
  const displayLabel = label.replace('Mark as Complete', 'Complete');

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center h-[56px] rounded-full overflow-hidden w-full ${baseBg} shadow-md mt-4 select-none touch-none`}
    >
      {/* Background Text */}
      <motion.div 
        style={{ opacity: hasConfirmed ? 0 : textOpacity }}
        className="absolute w-full h-full flex items-center justify-center pointer-events-none z-0 px-16"
      >
        <span className={`font-bold text-[14px] md:text-[15px] tracking-wide ${textColor} whitespace-nowrap`}>
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
          <span className={`font-bold text-[15px] tracking-wide ${textColor} whitespace-nowrap flex items-center gap-2`}>
            <Check className="w-5 h-5" /> Confirmed
          </span>
        </motion.div>
      )}

      {/* Draggable Thumb */}
      <motion.div
        drag={hasConfirmed ? false : "x"}
        dragConstraints={containerRef}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={`absolute left-1 z-20 w-[48px] h-[48px] bg-white dark:bg-zinc-100 rounded-full shadow-lg flex items-center justify-center ${hasConfirmed ? 'opacity-0 scale-50' : 'cursor-grab active:cursor-grabbing hover:scale-105'} transition-all duration-300`}
      >
        <ChevronRight className={`w-6 h-6 ${thumbIconColor}`} />
        <ChevronRight className={`w-6 h-6 -ml-4 ${thumbIconColor}`} />
      </motion.div>
    </div>
  );
}
