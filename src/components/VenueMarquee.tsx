'use client';

import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';

const VENUES = [
  { name: 'The River Palace Auditorium', city: 'Punalur' },
  { name: 'The Raviz Resort & Spa', city: 'Ashtamudi, Kollam' },
  { name: 'St. Mary’s Orthodox Cathedral', city: 'Kollam' },
  { name: 'Grand Hyatt Convention Centre', city: 'Bolgatty, Kochi' },
  { name: 'Al Saj Convention Centre', city: 'Kazhakkoottam, Trivandrum' },
  { name: 'Hotel Sea Pearl Grand Ballroom', city: 'Kollam' },
  { name: 'St. George Orthodox Church', city: 'Chandanapally' },
  { name: 'Le Méridien Convention Centre', city: 'Kochi' },
  { name: 'Bethel Auditorium & Open Grounds', city: 'Pathanamthitta' },
];

export default function VenueMarquee() {
  return (
    <div className="py-8 bg-brand-charcoal/40 border-y border-white/5 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-brand-gold/80 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-brand-gold" />
          Staged Across Kerala’s Premier Auditoriums & Heritage Cathedrals
          <Sparkles className="w-3 h-3 text-brand-gold" />
        </p>
      </div>

      {/* Infinite Scrolling Track */}
      <div className="flex w-max animate-marquee space-x-8 text-xs text-brand-muted hover:[animation-play-state:paused]">
        {[...VENUES, ...VENUES].map((venue, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-surface/60 border border-white/5 backdrop-blur-sm whitespace-nowrap hover:border-brand-gold/30 hover:text-brand-cream transition-colors"
          >
            <MapPin className="w-3 h-3 text-brand-gold" />
            <span className="font-serif font-medium text-brand-cream text-xs">{venue.name}</span>
            <span className="text-[10px] text-brand-gold/70">({venue.city})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
