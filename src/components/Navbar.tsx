'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark/90 border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-9 h-9 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center font-serif text-lg font-bold border border-brand-gold/30 group-hover:scale-105 transition-transform shadow-md shadow-brand-gold/5">
            ✦
          </span>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-cream">
              Occasion Desk
            </span>
            <span className="text-[10px] tracking-widest uppercase text-brand-gold font-medium">
              Event Industry OS
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-brand-muted">
          <a href="#industries" className="hover:text-brand-cream transition-colors">
            Who It&apos;s For
          </a>
          <a href="#features" className="hover:text-brand-cream transition-colors">
            Features
          </a>
          <a href="#workflows" className="hover:text-brand-cream transition-colors">
            Workflows
          </a>
          <a href="#pricing" className="hover:text-brand-cream transition-colors">
            Pricing
          </a>
          <Link href="/desk" className="text-brand-gold hover:text-brand-goldHover transition-colors flex items-center gap-1">
            Live Workspace ↗
          </Link>
        </nav>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          {/* Unified Partner Login */}
          <Link
            href="/login"
            className="py-2.5 px-4 rounded-xl bg-brand-surface border border-white/10 text-xs sm:text-sm font-medium text-brand-cream hover:bg-brand-charcoal transition-all hidden sm:inline-flex items-center gap-1.5"
          >
            Sign In
          </Link>

          {/* Primary Onboarding CTA */}
          <Link
            href="/onboard"
            className="py-2.5 px-5 rounded-xl bg-brand-gold text-brand-dark text-xs sm:text-sm font-semibold hover:bg-brand-goldHover transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-1.5 active:scale-95"
          >
            <span>Onboard Business</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
