'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

interface KineticCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export default function KineticCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: KineticCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      // Exponential out easing
      const progress = 1 - Math.pow(2, -10 * (frame / totalFrames));
      const current = Math.round(start + (end - start) * progress);
      setDisplayValue(current);

      if (frame >= totalFrames) {
        setDisplayValue(end);
        clearInterval(counter);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={`tabular-nums font-bold ${className}`}>
      {prefix}
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}
