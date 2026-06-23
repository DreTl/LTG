import { useEffect, useState } from 'react';
import { FaMedal } from 'react-icons/fa';
import Footer from '../components/Footer';
import ExportButtons from '../components/ExportButtons';
import PlayerOfWeekCard from '../components/PlayerOfWeekCard';
import CardPreview from '../components/CardPreview';
import { getTournaments, getPlayerOfTheWeek } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

function formatWeek(start, end) {
  if (!start) return '';
  const fmt = (s) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function PlayerOfTheWeekPage() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState('');
  const [data, setData] = useState(null);
  const [weekStart, setWeekStart] = useState('');
  const [loading, setLoading] = useState(true);
  const [potwLoading, setPotwLoading] = useState(false);

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

  const load = async (tid, week) => {
    setPotwLoading(true);
    try {
      const res = await getPlayerOfTheWeek(tid, week);
      setData(res.data);
      setWeekStart(res.data.week_start || '');
    } catch {
      toast.error('Failed to load player of the week');
      setData(null);
    } finally {
      setPotwLoading(false);
    }
  };

  useEffect(() => {
    if (!tournamentId) return;
    load(tournamentId, '');
  }, [tournamentId]);

  const tournament = tournaments.find((t) => String(t.id) === String(tournamentId));

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaMedal size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Player of the Week</h1>
            <p className="text-white/50 mt-2">Weekly standout performer graphics</p>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto"><TableSkeleton rows={6} cols={4} /></div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState emoji="🏅" title="No tournaments yet" subtitle="Create a tournament and record match events with dates." />
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8 items-start max-w-6xl mx-auto">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6 space-y-4">
                  <div>
                    <label className="form-label">Tournament</label>
                    <select className="form-select" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
                      {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} — {t.season}</option>
                      ))}
                    </select>
                  </div>
                  {data?.available_weeks?.length > 0 && (
                    <div>
                      <label className="form-label">Week</label>
                      <select
                        className="form-select"
                        value={weekStart}
                        onChange={(e) => { setWeekStart(e.target.value); load(tournamentId, e.target.value); }}
                      >
                        {data.available_weeks.map((w) => (
                          <option key={w} value={w}>
                            {formatWeek(w, new Date(new Date(w).getTime() + 6 * 86400000).toISOString().slice(0, 10))}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {data?.player_of_the_week && (
                  <ExportButtons
                    elementId="export-potw"
                    filename={`${data.player_of_the_week.name || 'player'}-of-the-week`.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}
                    tournamentName={data.player_of_the_week.name}
                    shareText={`🏅 ${data.player_of_the_week.name} — Player of the Week · ${tournament?.name} · generated with LTG`}
                    heading="Download player of the week"
                    subtitle="Premium spotlight graphic for social media."
                  />
                )}
              </div>

              <div className="lg:col-span-3">
                {potwLoading ? (
                  <div className="glass-card"><TableSkeleton rows={8} cols={4} /></div>
                ) : !data?.player_of_the_week ? (
                  <div className="glass-card">
                    <EmptyState emoji="🏅" title="No data for this week" subtitle="Record dated match events to compute weekly performers." />
                  </div>
                ) : (
                  <ScaleIn className="glass-card p-3 md:p-4 overflow-hidden">
                    <CardPreview>
                      <PlayerOfWeekCard
                        id="export-potw"
                        player={data.player_of_the_week}
                        weekStart={data.week_start}
                        weekEnd={data.week_end}
                        tournamentName={tournament?.name}
                      />
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
