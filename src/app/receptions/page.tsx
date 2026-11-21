import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowUpRight, Sparkles, Check } from 'lucide-react';

export default function ReceptionsPage() {
  const highlights = [
    {
      title: 'Architectural Stage Lighting & Trussing',
      desc: 'Precision warm washes, moving heads, and ambient backlights that elevate evening reception photography without harsh glare.',
    },
    {
      title: 'Grand Entrance & Welcome Foyers',
      desc: 'Double-height entrance arches, candlelit mirror consoles, and personalized welcome signage that warmly greet guests.',
    },
    {
      title: 'Live Sound & Acoustic Integration',
      desc: 'Discreet speaker placement and sound console routing so celebratory music fills the venue evenly while allowing comfortable conversation.',
    },
    {
      title: 'Tiered Seating & Dining Layouts',
      desc: 'Spatial planning that accommodates 300 to 2,000 guests smoothly, with clear buffet pathways and VIP family seating.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark">
      <Navbar />

      <main>
        <section className="relative pt-16 pb-24 overflow-hidden border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-white/5 text-brand-gold text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Grand Receptions & Evening Galas
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-normal text-brand-cream leading-tight">
                An evening of light, <br />
                <span className="italic text-brand-gold font-serif">music & celebration.</span>
              </h1>
              <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
                Receptions are where your celebration turns into an unforgettable night with family and friends. We handle complete stage trussing, floral paneling, dynamic lighting, and banquet layouts across Punalur and surrounding regions.
              </p>
              <div className="pt-2">
                <Link
                  href="/#inquiry"
                  className="inline-flex items-center gap-2 py-4 px-8 rounded-full bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all shadow-xl shadow-brand-gold/15"
                >
                  Plan Your Reception With Us <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-brand-deep/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"
                  alt="Evening reception stage lighting"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Stage Architecture</span>
                  <p className="text-sm text-brand-cream font-serif">Pastel Floral & Warm Ambient Wash</p>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80"
                  alt="Banquet dinner setup"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Banquet Ambiance</span>
                  <p className="text-sm text-brand-cream font-serif">Curated Table Escapes & Floral Centerpieces</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16">
              {highlights.map((h, i) => (
                <div key={i} className="p-6 rounded-2xl bg-brand-charcoal/50 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-brand-gold font-serif text-lg font-medium">
                    <Check className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    <span>{h.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed pl-7">
                    {h.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
