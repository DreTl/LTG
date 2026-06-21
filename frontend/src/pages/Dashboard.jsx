import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { getStats, getTournaments } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, StaggerGroup, StaggerItem } from '../components/ui/Motion';
import { StatSkeletonGrid, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

function getExportCount() {
  return Number(localStorage.getItem('ltg-export-count') || 0);
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total_tournaments: 0, total_teams: 0, total_matches: 0 });
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tournamentsRes] = await Promise.all([getStats(), getTournaments()]);
        setStats(statsRes.data);
        setTournaments(tournamentsRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Teams', value: stats.total_teams },
    { label: 'Total Matches', value: stats.total_matches },
    { label: 'Leagues', value: stats.total_tournaments },
    { label: 'Exports', value: getExportCount() },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <SlideUp className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <span className="pill-badge mb-3">Dashboard</span>
            <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">Welcome back</h1>
            <p className="text-white/40 mt-2 text-sm">Manage leagues and generate world-class standings</p>
          </div>
          <Link to="/admin/tournaments" className="btn-ltg btn-ltg-primary px-6 py-3">
            <FaPlus size={12} /> New Tournament
          </Link>
        </SlideUp>

        {loading ? (
          <div className="mb-10">
            <StatSkeletonGrid />
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
            {statCards.map((card) => (
              <StaggerItem key={card.label} className="stat-widget">
                <span className="stat-glow" aria-hidden="true" />
                <span className="stat-label">{card.label}</span>
                <p className="stat-value mt-6">{card.value}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        <SlideUp delay={0.1} className="glass-card p-6 md:p-8">
          <h2 className="display-heading text-2xl text-white mb-6">Recent Tournaments</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} style={{ height: 48 }} />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <EmptyState
              emoji="📊"
              title="Create your first tournament"
              subtitle="Set up a league, add teams, and start generating standings."
              actionLabel="Create Tournament"
              actionTo="/admin/tournaments"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/35 text-xs uppercase tracking-wider">
                    <th className="pb-4 font-semibold">Name</th>
                    <th className="pb-4 font-semibold">Season</th>
                    <th className="pb-4 font-semibold">Teams</th>
                    <th className="pb-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.slice(0, 5).map((t) => (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="py-4 font-medium text-white">{t.name}</td>
                      <td className="py-4 text-white/50 text-sm">{t.season}</td>
                      <td className="py-4 text-white/50 text-sm font-numeric">{t.number_of_teams}</td>
                      <td className="py-4">
                        <Link
                          to={`/admin/tournament/${t.id}/teams`}
                          className="btn-ltg btn-ltg-ghost px-4 py-1.5 text-sm"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SlideUp>
      </main>
    </div>
  );
}
