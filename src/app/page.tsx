import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LeadInquiryForm from '@/components/LeadInquiryForm';
import { ArrowUpRight, Phone, Instagram, Calendar, MapPin, Sparkles, ShieldCheck, HeartHandshake, Users } from 'lucide-react';

export default function HomePage() {
  const occasions = [
    {
      id: 'weddings',
      title: 'Traditional & Modern Weddings',
      tagline: 'Ceremony decor, bridal aisle, floral canopies & mandap architecture',
      guests: '200 - 1500+ guests',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
      badge: 'Signature Service',
      href: '/weddings',
    },
    {
      id: 'receptions',
      title: 'Grand Receptions & Galas',
      tagline: 'Illuminated stage architecture, acoustic trussing & ambient light',
      guests: '300 - 2000+ guests',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
      badge: 'Stage & Trussing',
      href: '/receptions',
    },
    {
      id: 'mini-events',
      title: 'Intimate Celebrations & Engagements',
      tagline: 'Ring ceremonies, milestone birthdays, and private courtyard banquets',
      guests: '50 - 200 guests',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
      badge: 'Curated Intimacy',
      href: '/mini-events',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-white/5 text-brand-gold text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Premier Event Architects · Punalur & Kollam
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-brand-cream leading-[1.08]">
                Make it a celebration <br />
                <span className="italic text-brand-gold font-serif">to remember forever.</span>
              </h1>

              <p className="text-brand-muted text-base sm:text-lg max-w-xl leading-relaxed">
                From majestic wedding ceremonies to intimate celebrations, we orchestrate custom stage architecture, lighting scapes, and floral artistry tailored precisely to your family’s vision.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#inquiry"
                  className="py-4 px-8 rounded-full bg-brand-gold text-brand-dark font-semibold text-sm sm:text-base hover:bg-brand-goldHover transition-all flex items-center gap-2 shadow-xl shadow-brand-gold/20"
                >
                  Start Your Consultation
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/__heavenly_events___/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-6 rounded-full bg-brand-charcoal border border-white/10 text-brand-cream font-medium text-sm sm:text-base hover:bg-brand-surface transition-all flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4 text-brand-gold" />
                  View Instagram Works
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                <div>
                  <div className="text-2xl font-serif font-bold text-brand-cream">100%</div>
                  <div className="text-xs text-brand-muted">Bespoke Styling</div>
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-brand-cream">Punalur</div>
                  <div className="text-xs text-brand-muted">Local Expertise</div>
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-brand-cream">Zero</div>
                  <div className="text-xs text-brand-muted">Execution Stress</div>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] bg-brand-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85"
                  alt="Heavenly Events Luxury Wedding Setup"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <div className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Featured Setup</div>
                  <div className="text-sm font-serif font-medium text-brand-cream">Grand Stage & Floral Architecture</div>
                  <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-brand-gold" /> Punalur, Kerala
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Occasions Showcase */}
      <section id="occasions" className="py-24 bg-brand-deep/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-brand-gold font-semibold">Our Portfolio</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-brand-cream mt-2 mb-4">
              Celebrations Crafted with Care
            </h2>
            <p className="text-brand-muted text-sm sm:text-base">
              Explore our core styling specialties. Each design is custom-built to venue dimensions and client aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {occasions.map((occ) => (
              <div
                key={occ.id}
                className="group rounded-3xl bg-brand-charcoal/60 border border-white/5 overflow-hidden hover:border-brand-gold/40 transition-all duration-300 flex flex-col shadow-xl"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-brand-dark">
                  <Image
                    src={occ.image}
                    alt={occ.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 py-1 px-3 rounded-full bg-brand-dark/80 backdrop-blur-md border border-white/10 text-xs font-medium text-brand-gold">
                    {occ.badge}
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif text-brand-cream group-hover:text-brand-gold transition-colors">
                      {occ.title}
                    </h3>
                    <p className="text-brand-muted text-xs sm:text-sm mt-2 leading-relaxed">
                      {occ.tagline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-gold" /> {occ.guests}
                    </span>
                    <Link
                      href={occ.href}
                      className="text-brand-gold font-medium hover:underline flex items-center gap-1"
                    >
                      Explore Setup ↗
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Consultation Form */}
      <section id="inquiry" className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadInquiryForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
