'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const phone = '919074624023';
  const defaultText = encodeURIComponent(
    'Hello Jomit & Savio! I am visiting the Heavenly Events website and would like to check date availability and get a 3D stage layout estimate for our upcoming celebration.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="w-80 rounded-2xl bg-brand-charcoal border border-brand-gold/30 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-brand-charcoal animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-medium text-brand-cream">Jomit & Savio</h4>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <Sparkles className="w-2.5 h-2.5" /> Partners • Online Now
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-brand-muted hover:text-brand-cream transition-colors p-1"
              aria-label="Close message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-brand-cream/80 leading-relaxed mb-4">
            Namaskaram! Looking for custom stage décor, church nuptials, or reception architecture in Kerala? We reply within 15 minutes.
          </p>

          <a
            href={`https://wa.me/${phone}?text=${defaultText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
          >
            <MessageCircle className="w-4 h-4" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 border border-white/20"
        aria-label="Open WhatsApp Consultation"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          WhatsApp Consultation
        </span>
      </button>
    </div>
  );
}
