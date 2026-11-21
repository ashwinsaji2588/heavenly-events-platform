'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Users, MessageCircle } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  location: string;
  guests: string;
  description: string;
  imageUrl: string;
  palette: string[];
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'stage-1',
    title: 'The Imperial Ivory & Gold Mandap',
    category: 'Grand Traditional Wedding',
    location: 'Punalur, Kollam',
    guests: '800 - 1500 Guests',
    description: 'Handcrafted floral arches with grand lotus mandap architecture, crystal chandeliers, and warm amber architectural backlighting.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85',
    palette: ['#C5A880', '#EBD6B6', '#141813'],
  },
  {
    id: 'stage-2',
    title: 'Starlit Enchanted Forest Canopy',
    category: 'Open-Air Reception & Cocktail',
    location: 'Ashtamudi Lake, Kollam',
    guests: '300 - 700 Guests',
    description: 'Thousands of micro-fairy lights draped across custom geometric trussing, weeping wisteria florals, and floating candle scapes.',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=85',
    palette: ['#8C9489', '#C5A880', '#191E18'],
  },
  {
    id: 'stage-3',
    title: 'Contemporary Minimalist Glass Arch',
    category: 'Ring Ceremony & Nuptials',
    location: 'Trivandrum',
    guests: '150 - 350 Guests',
    description: 'Sleek mirrored runway, asymmetric white orchids, muted gold accents, and subtle haze-accented followspot lighting.',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85',
    palette: ['#F4F1EA', '#C5A880', '#232822'],
  },
  {
    id: 'stage-4',
    title: 'Royal Kerala Heritage Courtyard',
    category: 'Traditional Christian Nuptials',
    location: 'Pathanamthitta',
    guests: '500 - 1200 Guests',
    description: 'Brass urulis, marigold cascades, handcrafted wooden facade integration, and soft bell-lit cathedral ceiling trussing.',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=85',
    palette: ['#B6966A', '#C5A880', '#141813'],
  },
  {
    id: 'stage-5',
    title: 'Midnight Celestial Gala Stage',
    category: 'Grand Sangeet & Reception',
    location: 'Kollam Beach Resort',
    guests: '400 - 1000 Guests',
    description: 'Deep navy velour drapes, curved high-definition LED digital backdrop matrix, moving wash lights, and cold spark pyrotechnics.',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=85',
    palette: ['#191E18', '#C5A880', '#EBD6B6'],
  },
];

export default function StageCoverflowGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? GALLERY_ITEMS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === GALLERY_ITEMS.length - 1 ? 0 : prev + 1));
  };

  const activeItem = GALLERY_ITEMS[currentIndex];

  const getWhatsAppLink = (item: GalleryItem) => {
    const text = encodeURIComponent(
      `Hello Jomit & Savio! I saw "${item.title}" on the Heavenly Events website. We are planning an event in Kerala and would love to check availability and get a customized quote for this style.`
    );
    return `https://wa.me/919074624023?text=${text}`;
  };

  return (
    <section className="relative py-24 bg-brand-deep/80 overflow-hidden border-t border-white/5">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-gold/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-white/10 text-brand-gold text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              OriginKit 3D Showcase
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
              Signature Stage & Venue Architecture
            </h2>
            <p className="text-brand-muted text-sm sm:text-base max-w-xl">
              Every celebration is a custom canvas. Swipe through our masterwork wedding mandaps, reception stages, and starlit open-air canopies.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              aria-label="Previous setup"
              className="w-12 h-12 rounded-full border border-white/10 bg-brand-charcoal text-brand-cream hover:bg-brand-gold hover:text-brand-dark transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-mono text-brand-muted px-2">
              <span className="text-brand-gold font-bold text-sm">0{currentIndex + 1}</span> / 0{GALLERY_ITEMS.length}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Next setup"
              className="w-12 h-12 rounded-full border border-white/10 bg-brand-charcoal text-brand-cream hover:bg-brand-gold hover:text-brand-dark transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Coverflow Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Visual Display */}
          <div className="lg:col-span-8 relative">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal group">
              <Image
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-black/30" />

              {/* Tag Overlays */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-brand-dark/85 backdrop-blur-md border border-white/10 text-xs font-semibold text-brand-gold">
                  {activeItem.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/5 text-[11px] text-brand-cream/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-gold" /> {activeItem.location}
                </span>
              </div>

              {/* Mobile details badge */}
              <div className="absolute bottom-6 left-6 right-6 lg:hidden p-4 rounded-2xl bg-brand-dark/85 backdrop-blur-md border border-white/10">
                <h3 className="text-lg font-serif text-brand-cream">{activeItem.title}</h3>
                <p className="text-xs text-brand-muted mt-1 line-clamp-2">{activeItem.description}</p>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
              {GALLERY_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border transition-all duration-300 ${
                    currentIndex === idx
                      ? 'border-brand-gold scale-105 ring-2 ring-brand-gold/30'
                      : 'border-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details & WhatsApp Callout */}
          <div className="lg:col-span-4 space-y-6 lg:pl-4">
            <div className="p-8 rounded-3xl bg-brand-charcoal/60 border border-white/10 backdrop-blur-md space-y-6 shadow-xl">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-widest text-brand-gold font-semibold">Concept Overview</div>
                <h3 className="text-2xl font-serif text-brand-cream leading-snug">
                  {activeItem.title}
                </h3>
              </div>

              <p className="text-brand-muted text-sm leading-relaxed">
                {activeItem.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-brand-cream/90">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-gold" /> Ideal Scale:
                  </span>
                  <span className="font-medium text-brand-cream">{activeItem.guests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Primary Palette:</span>
                  <div className="flex items-center gap-1.5">
                    {activeItem.palette.map((color, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Turnaround:</span>
                  <span className="text-brand-gold font-medium">Bespoke 3D render in 48h</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={getWhatsAppLink(activeItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp for This Style
                </a>
                <p className="text-[11px] text-center text-brand-muted mt-2">
                  Instant response from Jomit & Savio within 15 mins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
