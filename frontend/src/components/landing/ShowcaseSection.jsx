import { FaUsers, FaChartBar } from 'react-icons/fa';
import TeamAvatar from '../TeamAvatar';

const teams = ['Simba FC', 'Young Stars', 'Warriors Utd', 'Eagles FC', 'Lions FC'];

export default function ShowcaseSection() {
  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="landing-feature-card p-8 md:p-10">
            <span className="landing-pill-badge">TEAM MANAGEMENT</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-6 mb-4 tracking-tight">
              Distinguish every team
            </h2>
            <p className="text-white/45 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Register teams with logos, manage squads, and keep every tournament organized
              from kickoff to the final standings.
            </p>
            <div className="space-y-3">
              {teams.map((team, i) => (
                <div
                  key={team}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                  style={{ opacity: 1 - i * 0.08 }}
                >
                  <TeamAvatar name={team} size={36} fontFamily="inherit" />
                  <span className="text-white/80 font-medium text-sm">{team}</span>
                  <FaUsers className="ml-auto text-white/20 text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="landing-feature-card p-8 md:p-10">
            <span className="landing-pill-badge">LIVE STANDINGS</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-6 mb-4 tracking-tight">
              Tournament insights
            </h2>
            <p className="text-white/45 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Points, goal difference, and rankings update instantly when match results
              are entered. Always accurate, always current.
            </p>
            <div className="landing-chart-mock rounded-2xl p-6 border border-white/10">
              <div className="flex items-end justify-between gap-2 h-32 mb-4">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-red-600 to-red-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-2">
                  <FaChartBar className="text-red-400" /> Points progression
                </span>
                <span>Season 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
