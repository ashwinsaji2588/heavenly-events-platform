import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowUpRight, Sparkles, Check } from 'lucide-react';

export default function MiniEventsPage() {
  const points = [
    {
      title: 'Engagement & Ring Ceremonies',
      desc: 'Intimate floral backdrops, ring exchange plinths, and warm fairy lighting crafted for close family gatherings.',
    },
    {
      title: 'Milestone Birthdays & Anniversaries',
      desc: 'Chic balloon and fresh floral arrangements, personalized neon signage, and photo-ready dessert stations.',
    },
    {
      title: 'Private Courtyard & Home Banquets',
      desc: 'Transforming family homes and garden spaces into warm, professionally styled celebration grounds.',
    },
    {
      title: 'Fast & Stress-Free Coordination',
      desc: 'Swift setup and teardown handled entirely by our in-house crew so your family can simply enjoy the moment.',
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
                Intimate Celebrations · 30 to 200 Guests
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-normal text-brand-cream leading-tight">
                Intimate gatherings, <br />
                <span className="italic text-brand-gold font-serif">flawlessly styled.</span>
              </h1>
              <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
                Small celebrations deserve just as much attention to detail as grand weddings. We bring bespoke floral artistry, personalized backdrops, and seamless styling to engagements, anniversaries, and family milestones in Punalur.
              </p>
              <div className="pt-2">
                <Link
                  href="/#inquiry"
                  className="inline-flex items-center gap-2 py-4 px-8 rounded-full bg-brand-gold text-brand-dark font-semibold text-sm hover:bg-brand-goldHover transition-all shadow-xl shadow-brand-gold/15"
                >
                  Ask About Your Mini Event <ArrowUpRight className="w-4 h-4" />
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
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80"
                  alt="Intimate outdoor banquet"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Intimate Ambience</span>
                  <p className="text-sm text-brand-cream font-serif">Lawn Engagement & Family Gathering</p>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-brand-charcoal">
                <Image
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80"
                  alt="Floral styling and decor details"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10">
                  <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">Custom Details</span>
                  <p className="text-sm text-brand-cream font-serif">Pastel Floral Plinths & Backdrop</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16">
              {points.map((p, i) => (
                <div key={i} className="p-6 rounded-2xl bg-brand-charcoal/50 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-brand-gold font-serif text-lg font-medium">
                    <Check className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed pl-7">
                    {p.desc}
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
