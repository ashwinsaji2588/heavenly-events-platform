import React from 'react';
import { Star, Heart, MapPin, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  couple: string;
  venue: string;
  location: string;
  service: string;
  quote: string;
  date: string;
}

const REVIEWS: Testimonial[] = [
  {
    id: 'rev-1',
    couple: 'Rohan & Anjali Nair',
    venue: 'The River Palace Auditorium',
    location: 'Punalur',
    service: 'Traditional Hindu Wedding & Reception',
    quote: 'Jomit and the Heavenly Events team created something out of a fairytale. The lotus mandap and amber lighting stunned every single guest. What amazed us most was how punctual and calm they were—zero stress for our parents!',
    date: 'October 2026',
  },
  {
    id: 'rev-2',
    couple: 'Mathew & Sherin Philip',
    venue: 'St. Mary’s Cathedral & Open Lawn',
    location: 'Kollam',
    service: 'Church Nuptials & Starlit Reception',
    quote: 'Savio coordinated our fairy-light canopy across the lawn and it looked like a high-end European wedding right here in Kollam. Their 3D blueprint beforehand matched the final stage 100%. Truly heavenly!',
    date: 'November 2026',
  },
  {
    id: 'rev-3',
    couple: 'Arjun & Dr. Deepa',
    venue: 'Hotel Sea Pearl Grand Ballroom',
    location: 'Kollam',
    service: 'Sangeet Gala & Stage Trussing',
    quote: 'The acoustic trussing, cold pyro fountains, and moving head lights gave our Sangeet the energy of an award show. The team treated our wedding like their own family function.',
    date: 'September 2026',
  },
];

export default function TestimonialRatingSection() {
  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-white/10 text-brand-gold text-xs font-semibold tracking-wider uppercase">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            Verified Client Love
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-brand-cream">
            Trusted by 350+ Kerala Families
          </h2>
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm font-semibold text-brand-cream ml-2">4.9 / 5.0 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="rounded-3xl bg-brand-charcoal/40 border border-white/5 p-8 flex flex-col justify-between hover:border-brand-gold/30 hover:bg-brand-charcoal/70 transition-all duration-300 shadow-xl relative group"
            >
              <Quote className="w-8 h-8 text-brand-gold/20 mb-4 group-hover:text-brand-gold/40 transition-colors" />

              <div className="space-y-4 flex-1">
                <p className="text-brand-cream/90 text-sm leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-serif font-semibold text-brand-cream text-base">
                    {rev.couple}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-brand-gold font-medium">{rev.service}</div>
                <div className="text-[11px] text-brand-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-gold" /> {rev.venue}, {rev.location} • {rev.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
