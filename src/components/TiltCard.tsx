'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  enableSpotlight?: boolean;
}

export default function TiltCard({
  children,
  className = '',
  enableSpotlight = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for natural tactile feel
  const springConfig = { stiffness: 300, damping: 24, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  // Dynamic cursor position for spotlight gradient
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    x.set(clientX / rect.width - 0.5);
    y.set(clientY / rect.height - 0.5);

    if (enableSpotlight) {
      setSpotlightPos({ x: clientX, y: clientY });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative will-change-transform ${className}`}
    >
      {/* Dynamic Cursor Spotlight Radial Highlight */}
      {enableSpotlight && (
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-20"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(197, 168, 128, 0.16), transparent 70%)`,
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
