import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaIdCard, FaHistory } from 'react-icons/fa';
import TeamProfileCard from '../components/TeamProfileCard';
import ExportButtons from '../components/ExportButtons';
import Footer from '../components/Footer';
import { getTournaments, getTeams, getTeamProfile } from '../services/api';
import {
  EXPORT_TOTAL_WIDTH,
  EXPORT_TOTAL_HEIGHT,
} from '../utils/exportDimensions';
import { saveCardToHistory } from '../utils/cardHistory';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

function CardPreview({ children }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.4);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / EXPORT_TOTAL_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%', height: EXPORT_TOTAL_HEIGHT * scale, overflow: 'hidden' }}>
      <div style={{ width: EXPORT_TOTAL_WIDTH, height: EXPORT_TOTAL_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}

export default function TeamProfilePage() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

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
    setTeamId('');
    setProfile(null);
    (async () => {
      try {
        const res = await getTeams(tournamentId);
        setTeams(res.data);
        if (res.data.length) setTeamId(String(res.data[0].id));
      } catch {
        toast.error('Failed to load teams');
      }
    })();
  }, [tournamentId]);

  useEffect(() => {
    if (!teamId) return;
    setProfileLoading(true);
    (async () => {
      try {
        const res = await getTeamProfile(teamId);
        setProfile(res.data);
      } catch {
        toast.error('Failed to load team profile');
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [teamId]);

  const filename = `${profile?.team_name || 'team'}-profile`
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  const handleExported = useCallback(
    (canvas) => {
      if (!profile) return;
      saveCardToHistory(canvas, {
        team_name: profile.team_name,
        tournament_name: profile.tournament_name,
        position: profile.position,
        points: profile.points,
      });
    },
    [profile]
  );

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaIdCard size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Team Profile Cards</h1>
            <p className="text-white/50 mt-2">Studio-quality team graphics — no Photoshop needed</p>
            <div className="mt-4">
              <Link to="/team-profile/history" className="btn-ltg btn-ltg-ghost px-4 py-2 text-sm">
                <FaHistory /> View history
              </Link>
            </div>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto"><TableSkeleton rows={6} cols={6} /></div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState emoji="🪪" title="No tournaments yet" subtitle="Create a tournament and teams to generate profile cards." />
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
                  <div>
                    <label className="form-label">Team</label>
                    <select
                      className="form-select"
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      disabled={!teams.length}
                    >
                      {teams.length === 0 ? (
                        <option>No teams</option>
                      ) : (
                        teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)
                      )}
                    </select>
                  </div>
                </div>

                {profile && (
                  <ExportButtons
                    elementId="export-team-profile-card"
                    filename={filename}
                    tournamentName={profile.team_name}
                    shareText={`📊 ${profile.team_name} — ${profile.tournament_name} profile card · generated with LTG`}
                    heading="Download team card"
                    subtitle="Share-ready for WhatsApp, Telegram, Facebook, Instagram & printing."
                    onExported={handleExported}
                  />
                )}
              </div>

              <div className="lg:col-span-3">
                {profileLoading ? (
                  <div className="glass-card"><TableSkeleton rows={8} cols={4} /></div>
                ) : !profile ? (
                  <div className="glass-card">
                    <EmptyState emoji="🪪" title="Select a team" subtitle="Pick a tournament and team to preview its card." />
                  </div>
                ) : (
                  <ScaleIn className="glass-card p-3 md:p-4 overflow-hidden">
                    <CardPreview>
                      <TeamProfileCard id="export-team-profile-card" data={profile} />
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
