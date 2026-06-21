import { FaBolt, FaShieldAlt, FaChartLine, FaSync, FaUsers, FaListOl } from 'react-icons/fa';

const cards = [
  {
    icon: FaBolt,
    title: 'Effortless setup',
    description: 'Create a tournament, add teams, and enter results in minutes. No design skills required.',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure & reliable',
    description: 'Your league data stays organized. Edit or delete results anytime to fix mistakes.',
  },
  {
    icon: FaChartLine,
    title: 'Actionable standings',
    description: 'Gold, silver, bronze highlights and automatic ranking by points, GD, and goals scored.',
  },
];

const highlights = [
  { icon: FaChartLine, label: 'Smart rankings' },
  { icon: FaUsers, label: 'Team logos' },
  { icon: FaListOl, label: 'Match tracking' },
];

export default function AutomationSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="landing-arc-glow" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="landing-pill-badge">AUTOMATED STANDINGS</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-6 tracking-tight">
            Never miss an update
          </h2>
          <p className="text-white/45 mt-4 max-w-xl mx-auto">
            Standings recalculate the moment a result is saved — ready to export and share.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="landing-feature-card p-6 md:p-8">
                <Icon className="text-red-400 text-xl mb-4" />
                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 text-white/50 text-sm">
                <Icon className="text-red-400/70" />
                <span>{item.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <FaSync className="text-red-400/70" />
            <span>Real-time updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
