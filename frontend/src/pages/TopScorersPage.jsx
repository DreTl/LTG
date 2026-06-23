import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRunning, FaBullseye } from 'react-icons/fa';
import Footer from '../components/Footer';
import TeamAvatar from '../components/TeamAvatar';
import PlayerAvatar from '../components/PlayerAvatar';
import ExportButtons from '../components/ExportButtons';
import ScorersCard from '../components/ScorersCard';
import CardPreview from '../components/CardPreview';
import { getTournaments, getTopScorers } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function TopScorersPage() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState('');
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTournaments();
        setTournaments(res.data);
        if (res.data.length) setTournamentId(String(res.data[0].id));
      } catch {
        toast.error('Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!tournamentId) return;
    setListLoading(true);
    (async () => {
      try {
        const res = await getTopScorers(tournamentId);
        setScorers(res.data);
      } catch {
        toast.error('Failed to load top scorers');
        setScorers([]);
      } finally {
        setListLoading(false);
      }
    })();
  }, [tournamentId]);

  const tournament = tournaments.find((t) => String(t.id) === String(tournamentId));

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaRunning size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Top Scorers</h1>
            <p className="text-white/50 mt-2">Live goal rankings across the season</p>
            <div className="mt-4">
              <Link to="/golden-boot" className="btn-ltg btn-ltg-ghost px-4 py-2 text-sm">
                <FaBullseye /> Golden Boot graphics
              </Link>
            </div>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto"><TableSkeleton rows={8} cols={4} /></div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState emoji="⚽" title="No tournaments yet" subtitle="Create a tournament and record match events to rank scorers." />
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8 items-start max-w-6xl mx-auto">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6">
                  <label className="form-label">Tournament</label>
                  <select className="form-select" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {t.season}</option>
                    ))}
                  </select>
                </div>

                <div className="glass-card overflow-hidden">
                  {listLoading ? (
                    <TableSkeleton rows={6} cols={4} />
                  ) : scorers.length === 0 ? (
                    <EmptyState emoji="🥅" title="No goals yet" subtitle="Record match events to populate the scoring chart." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-white/30">
                            <th className="p-3 font-medium">Pos</th>
                            <th className="p-3 font-medium">Player</th>
                            <th className="p-3 font-medium">Team</th>
                            <th className="p-3 text-center font-medium">Goals</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scorers.map((p) => (
                            <tr key={p.id} className="border-t border-white/5">
                              <td className="p-3 font-bold text-white/70">{p.rank}</td>
                              <td className="p-3">
                                <span className="flex items-center gap-2">
                                  <PlayerAvatar name={p.name} photo={p.photo} size={30} fontFamily="inherit" />
                                  <span className="text-white truncate">
                                    {p.jersey_number != null ? `#${p.jersey_number} ` : ''}{p.name}
                                  </span>
                                </span>
                              </td>
                              <td className="p-3 text-white/60">
                                <span className="flex items-center gap-2">
                                  <TeamAvatar name={p.team_name} logo={p.team_logo} size={24} fontFamily="inherit" />
                                  <span className="truncate">{p.team_name}</span>
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold text-amber-300">{p.goals}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {scorers.length > 0 && (
                  <ExportButtons
                    elementId="export-top-scorers"
                    filename={`${tournament?.name || 'top'}-top-scorers`.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}
                    tournamentName={tournament?.name}
                    shareText={`⚽ Top Scorers — ${tournament?.name} · generated with LTG`}
                    heading="Download top scorers"
                    subtitle="Share-ready ranking graphic for social media."
                  />
                )}
              </div>

              <div className="lg:col-span-3">
                {scorers.length > 0 && (
                  <ScaleIn className="glass-card p-3 md:p-4 overflow-hidden">
                    <CardPreview>
                      <ScorersCard id="export-top-scorers" title="Top Scorers" subtitle={tournament ? `${tournament.name} • ${tournament.season}` : ''} players={scorers} season={tournament?.season} />
                    </CardPreview>
                  </ScaleIn>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
