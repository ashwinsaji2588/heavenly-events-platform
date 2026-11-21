'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-gold via-amber-200 to-yellow-500 origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(197,168,128,0.7)]"
    />
  );
}
