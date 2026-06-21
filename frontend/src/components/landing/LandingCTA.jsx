import OriginButton from '../ui/OriginButton';

export default function LandingCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="landing-cta-glow" aria-hidden="true" />
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          Ready to generate your league table?
        </h2>
        <p className="text-white/45 mb-8 max-w-lg mx-auto">
          Join organizers who stopped spending hours on standings graphics every week.
        </p>
        <OriginButton to="/admin/login" className="landing-btn-primary text-base px-10 py-3.5">
          Start Free — Admin Login
        </OriginButton>
      </div>
    </section>
  );
}
