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
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-surface/90 border border-brand-gold/30 shadow-xl shadow-brand-gold/5 backdrop-blur-md text-brand-gold text-xs font-medium tracking-wide ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
      </span>
      <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
      <span>{text}</span>
      {subtext && <span className="text-brand-muted border-l border-white/10 pl-2 ml-0.5">{subtext}</span>}
    </motion.div>
  );
}
