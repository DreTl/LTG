import { useEffect, useState } from 'react';
import { FaStar, FaMedal } from 'react-icons/fa';
import Footer from '../components/Footer';
import { getTournaments, getBestTeam } from '../services/api';
import { toast } from 'react-toastify';
import TeamAvatar from '../components/TeamAvatar';
import { SlideUp, FadeIn, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

function formatWeekRange(start, end) {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric' };
  const s = new Date(start + 'T00:00:00').toLocaleDateString(undefined, opts);
  const e = new Date(end + 'T00:00:00').toLocaleDateString(undefined, {
    ...opts,
    year: 'numeric',
  });
  return `${s} – ${e}`;
}

export default function BestTeamPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultLoading, setResultLoading] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await getTournaments();
        setTournaments(res.data);
        if (res.data.length > 0) {
          setSelectedId(String(res.data[0].id));
        }
      } catch (err) {
        toast.error('Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setSelectedWeek('');
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    const fetchBestTeam = async () => {
      setResultLoading(true);
      try {
        const res = await getBestTeam(selectedId, selectedWeek || undefined);
        setData(res.data);
        if (!selectedWeek && res.data.week_start) {
          setSelectedWeek(res.data.week_start);
        }
      } catch (err) {
        toast.error('Failed to load best team');
        setData(null);
      } finally {
        setResultLoading(false);
      }
    };
    fetchBestTeam();
  }, [selectedId, selectedWeek]);

  const best = data?.best_team;
  const candidates = data?.candidates || [];

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaStar size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Team of the Week</h1>
            <p className="text-white/50 mt-2">The standout performer of each match week</p>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto">
              <TableSkeleton rows={6} cols={8} />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState
                emoji="🌟"
                title="No tournaments available"
                subtitle="The team of the week will appear once tournaments and results exist."
              />
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                <div className="flex-1">
                  <label className="form-label text-center block mb-2">Tournament</label>
                  <select
                    className="form-select form-select-lg text-center"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {t.season}</option>
                    ))}
                  </select>
                </div>
                {(data?.available_weeks?.length || 0) > 0 && (
                  <div className="flex-1">
                    <label className="form-label text-center block mb-2">Week</label>
                    <select
                      className="form-select form-select-lg text-center"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                    >
                      {data.available_weeks.map((w) => (
                        <option key={w} value={w}>
                          {formatWeekRange(w, new Date(new Date(w + 'T00:00:00').getTime() + 6 * 86400000).toISOString().slice(0, 10))}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="max-w-4xl mx-auto">
                {resultLoading ? (
                  <TableSkeleton rows={6} cols={8} />
                ) : !best ? (
                  <div className="glass-card">
                    <EmptyState
                      emoji="📅"
                      title="No results this week"
                      subtitle="Add dated match results to crown a team of the week."
                    />
                  </div>
                ) : (
                  <>
                    <ScaleIn className="glass-card mb-8 text-center">
                      <p className="text-white/50 uppercase tracking-widest text-xs mb-4">
                        {formatWeekRange(data.week_start, data.week_end)}
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <TeamAvatar logo={best.logo} name={best.team} size={88} shape="rounded" />
                          <span className="absolute -top-2 -right-2 text-yellow-400">
                            <FaMedal size={26} />
                          </span>
                        </div>
                        <h2 className="display-heading text-3xl text-white">{best.team}</h2>
                        <div className="flex flex-wrap justify-center gap-6 mt-2">
                          <Stat label="Points" value={best.points} highlight />
                          <Stat label="W-D-L" value={`${best.wins}-${best.draws}-${best.losses}`} />
                          <Stat label="GF" value={best.goals_for} />
                          <Stat label="GA" value={best.goals_against} />
                          <Stat label="GD" value={best.goal_difference} />
                          <Stat label="Rating" value={best.performance_score} highlight />
                        </div>
                      </div>
                    </ScaleIn>

                    {candidates.length > 1 && (
                      <FadeIn>
                        <h3 className="text-white/70 text-sm uppercase tracking-widest mb-4 px-1">
                          Week rankings
                        </h3>
                        <div className="ltg-table-wrap overflow-x-auto">
                          <table className="ltg-table">
                            <thead>
                              <tr>
                                <th className="text-left" style={{ width: '64px' }}>#</th>
                                <th className="text-left">Team</th>
                                <th className="text-center">P</th>
                                <th className="text-center">W</th>
                                <th className="text-center">D</th>
                                <th className="text-center">L</th>
                                <th className="text-center">GD</th>
                                <th className="text-center">PTS</th>
                                <th className="text-center">Rating</th>
                              </tr>
                            </thead>
                            <tbody>
                              {candidates.map((team) => (
                                <tr key={team.team_id}>
                                  <td>
                                    <span className={`ltg-pos ${team.position === 1 ? 'ltg-pos-gold' : 'ltg-pos-default'}`}>
                                      {team.position}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                                      <TeamAvatar logo={team.logo} name={team.team} size={32} shape="rounded" />
                                      <span className="font-medium text-white">{team.team}</span>
                                    </div>
                                  </td>
                                  <td className="text-center font-numeric text-white/70">{team.played}</td>
                                  <td className="text-center font-numeric text-white/70">{team.wins}</td>
                                  <td className="text-center font-numeric text-white/70">{team.draws}</td>
                                  <td className="text-center font-numeric text-white/70">{team.losses}</td>
                                  <td className="text-center font-numeric text-white/85">{team.goal_difference}</td>
                                  <td className="text-center pts-cell">{team.points}</td>
                                  <td className="text-center font-numeric text-white/85">{team.performance_score}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </FadeIn>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div className="text-center">
      <div className={`font-numeric text-2xl ${highlight ? 'text-white' : 'text-white/80'}`}>
        {value}
      </div>
      <div className="text-white/40 text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
