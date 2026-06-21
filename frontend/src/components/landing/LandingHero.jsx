import { Link } from 'react-router-dom';
import { FaTrophy } from 'react-icons/fa';
import OriginButton from '../ui/OriginButton';

const avatars = ['A', 'B', 'C', 'D'];

export default function LandingHero() {
  return (
    <section className="landing-hero relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="landing-spotlight landing-spotlight-left" aria-hidden="true" />
      <div className="landing-spotlight landing-spotlight-right" aria-hidden="true" />
      <div className="landing-grid" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex -space-x-2">
            {avatars.map((a, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#2a0808] bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white"
              >
                {a}
              </div>
            ))}
          </div>
          <span className="text-sm text-white/50">Trusted by village leagues & tournament organizers</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          The best platform to
          <br />
          <span className="landing-text-glow">grow your league</span>
        </h1>

        <p className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
          Automate football standings, export poster-ready tables, and share results
          on social media — without weekly graphic design work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <OriginButton to="/admin/login" className="landing-btn-primary">
            Get Started Now
          </OriginButton>
          <Link to="/standings" className="landing-btn-ghost">
            <FaTrophy className="text-sm" />
            View Standings
          </Link>
        </div>
      </div>
    </section>
  );
}
