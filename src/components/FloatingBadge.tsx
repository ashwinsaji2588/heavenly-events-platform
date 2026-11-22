'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface FloatingBadgeProps {
  text: string;
  subtext?: string;
  className?: string;
}

export default function FloatingBadge({
  text,
  subtext,
  className = '',
}: FloatingBadgeProps) {
  return (
    <motion.div
      animate={{
        y: [-3, 3, -3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-brand-surface/90 border border-brand-gold/30 shadow-xl shadow-brand-gold/5 backdrop-blur-md text-brand-gold text-[11px] sm:text-xs font-medium tracking-wide max-w-full ${className}`}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
      </span>
      <Sparkles className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
      <span className="truncate">{text}</span>
      {subtext && <span className="hidden md:inline text-brand-muted border-l border-white/10 pl-2 ml-0.5 whitespace-nowrap">{subtext}</span>}
    </motion.div>
  );
}
