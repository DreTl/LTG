import { useEffect, useState } from 'react';
import { FaBullseye } from 'react-icons/fa';
import Footer from '../components/Footer';
import ExportButtons from '../components/ExportButtons';
import ScorersCard from '../components/ScorersCard';
import CardPreview from '../components/CardPreview';
import { getTournaments, getTopScorers } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function GoldenBootPage() {
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
        const res = await getTopScorers(tournamentId, 10);
        setScorers(res.data);
      } catch {
        toast.error('Failed to load scorers');
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
            <span className="stat-icon-circle mx-auto mb-4"><FaBullseye size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Golden Boot Race</h1>
            <p className="text-white/50 mt-2">Premium top-10 scorer graphics — no Photoshop needed</p>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto"><TableSkeleton rows={8} cols={4} /></div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState emoji="🥇" title="No tournaments yet" subtitle="Create a tournament and record goals to start the race." />
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

                {scorers.length > 0 && (
                  <ExportButtons
                    elementId="export-golden-boot"
                    filename={`${tournament?.name || 'golden'}-golden-boot`.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}
                    tournamentName={tournament?.name}
                    shareText={`🥇 Golden Boot Race — ${tournament?.name} · generated with LTG`}
                    heading="Download golden boot graphic"
                    subtitle="Share-ready for WhatsApp, Instagram, Facebook & printing."
                  />
                )}
              </div>

              <div className="lg:col-span-3">
                {listLoading ? (
                  <div className="glass-card"><TableSkeleton rows={10} cols={3} /></div>
                ) : scorers.length === 0 ? (
                  <div className="glass-card">
                    <EmptyState emoji="🥅" title="No goals recorded" subtitle="Record match events to build the golden boot race." />
                  </div>
                ) : (
                  <ScaleIn className="glass-card p-3 md:p-4 overflow-hidden">
                    <CardPreview>
                      <ScorersCard id="export-golden-boot" title="Golden Boot Race" subtitle={tournament ? `${tournament.name} • ${tournament.season}` : ''} players={scorers} season={tournament?.season} />
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
