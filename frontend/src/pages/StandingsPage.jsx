import { useEffect, useState } from 'react';
import { FaTrophy } from 'react-icons/fa';
import StandingTable from '../components/StandingTable';
import Footer from '../components/Footer';
import { getTournaments, getStandings } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, FadeIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function StandingsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [standings, setStandings] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(false);

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

    const fetchStandings = async () => {
      setStandingsLoading(true);
      try {
        const res = await getStandings(selectedId);
        setStandings(res.data);
        const t = tournaments.find((t) => t.id === parseInt(selectedId));
        setTournament(t);
      } catch (err) {
        toast.error('Failed to load standings');
        setStandings([]);
      } finally {
        setStandingsLoading(false);
      }
    };
    fetchStandings();
  }, [selectedId, tournaments]);

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaTrophy size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">League Standings</h1>
            <p className="text-white/50 mt-2">Live tables for every tournament</p>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto">
              <TableSkeleton rows={8} cols={10} />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState
                emoji="📊"
                title="No tournaments available"
                subtitle="Standings will appear here once tournaments are created."
              />
            </div>
          ) : (
            <>
              <div className="mb-8 max-w-md mx-auto">
                <label className="form-label text-center block mb-2">Select Tournament</label>
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

              <div className="max-w-5xl mx-auto">
                {standingsLoading ? (
                  <TableSkeleton rows={8} cols={10} />
                ) : (
                  <FadeIn>
                    <StandingTable
                      standings={standings}
                      tournamentName={tournament?.name}
                      season={tournament?.season}
                      highlightPositions={true}
                    />
                  </FadeIn>
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
