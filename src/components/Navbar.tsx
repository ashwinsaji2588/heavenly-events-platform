'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark/85 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-serif text-lg group-hover:scale-105 transition-transform">
            ✦
          </span>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-cream">
            Heavenly Events
          </span>
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-brand-muted pl-2 border-l border-white/10">
            Punalur, Kerala
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-brand-muted">
          <Link href="/weddings" className="hover:text-brand-cream transition-colors">
            Weddings
          </Link>
          <Link href="/receptions" className="hover:text-brand-cream transition-colors">
            Receptions
          </Link>
          <Link href="/mini-events" className="hover:text-brand-cream transition-colors">
            Mini Events
          </Link>
          <Link href="/desk" className="text-brand-gold/90 hover:text-brand-gold font-medium flex items-center gap-1 transition-colors">
            Occasion Desk ↗
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-brand-gold">
            <a href="tel:+919074624023" className="hover:text-brand-cream transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91 90746 24023
            </a>
            <span className="text-white/20">|</span>
            <a href="tel:+918921744145" className="hover:text-brand-cream transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91 89217 44145
            </a>
          </div>
          <Link
            href="/#inquiry"
            className="py-2.5 px-5 rounded-full bg-brand-gold text-brand-dark text-xs sm:text-sm font-semibold hover:bg-brand-goldHover transition-all shadow-md shadow-brand-gold/10"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
