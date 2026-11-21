import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StageVisualizer3D from '@/components/StageVisualizer3D';
import { ArrowUpRight, Sparkles, Check, MapPin } from 'lucide-react';

export default function WeddingsPage() {
  const features = [
    {
      title: 'Bespoke Mandap & Altar Architecture',
      desc: 'Handcrafted floral domes, traditional Kerala brass elements, or contemporary pastel arches engineered specifically to your venue dimensions.',
    },
    {
      title: 'Bridal Aisle & Pathway Walkways',
      desc: 'Illuminated glass runways, rose petal carpets, and curated floral pedestals creating an unforgettable bridal entrance.',
    },
    {
      title: 'Ceremonial Seating & Royal Stage',
      desc: 'Tiered seating arrangements with acoustic sightline optimization, ensuring every guest feels intimately involved in your vows.',
    },
    {
      title: 'Photo Booths & Welcome Arcades',
      desc: 'Personalized monogram backdrops, vintage mirrors, and immersive entry arcades that set the tone the moment family arrives.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream selection:bg-brand-gold selection:text-brand-dark">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-white/5 text-brand-gold text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Wedding Ceremonies & Mandaps · Punalur & Kollam
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-normal text-brand-cream leading-tight">
                Traditional roots, <br />
                <span className="italic text-brand-gold font-serif">modern grandeur.</span>
              </h1>
              <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
                Whether orchestrating a traditional church altar in Punalur, a temple mandap adorned with jasmine and brass, or a contemporary open-air lawn wedding, our planners design setups that honor family tradition while looking breathtaking in photography.
              </p>
              <div className="pt-2">
                <Link
                  href="/#inquiry"
                  className="inline-flex items-center gap-2 py-4 px-8 rounded-full bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all shadow-xl shadow-brand-gold/15"
                >
                  Consult Our Wedding Planners <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Showcase */}
        <section className="py-20 bg-brand-deep/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80"
                  alt="Traditional Floral Mandap setup by Heavenly Events"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Grand Altar Setup</span>
                  <p className="text-sm text-brand-cream font-serif">River Palace Auditorium, Punalur</p>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"
                  alt="Floral aisle and guest pavilion"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Bridal Aisle & Canopy</span>
                  <p className="text-sm text-brand-cream font-serif">Kollam Heritage Lawn</p>
                </div>
              </div>
            </div>

            {/* 3D Stage & Spatial Visualizer */}
            <div className="mt-16">
              <StageVisualizer3D />
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-brand-charcoal/50 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-brand-gold font-serif text-lg font-medium">
                    <Check className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    <span>{f.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed pl-7">
                    {f.desc}
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
