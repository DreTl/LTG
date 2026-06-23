import { useEffect, useState } from 'react';
import { FaUserCircle, FaIdCard, FaUsers } from 'react-icons/fa';
import Footer from '../components/Footer';
import ExportButtons from '../components/ExportButtons';
import PlayerProfileCard from '../components/PlayerProfileCard';
import TeamSheetCard from '../components/TeamSheetCard';
import CardPreview from '../components/CardPreview';
import {
  getTournaments,
  getTeams,
  getPlayers,
  getPlayerProfile,
  getTeamSheet,
} from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function PlayerProfilePage() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState('');
  const [mode, setMode] = useState('player');

  const [profile, setProfile] = useState(null);
  const [teamSheet, setTeamSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);

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
    setPlayers([]);
    setPlayerId('');
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
    setPlayerId('');
    (async () => {
      try {
        const res = await getPlayers({ team_id: teamId });
        setPlayers(res.data);
        if (res.data.length) setPlayerId(String(res.data[0].id));
        else setProfile(null);
      } catch {
        toast.error('Failed to load players');
      }
    })();
  }, [teamId]);

  useEffect(() => {
    if (mode !== 'player' || !playerId) return;
    setCardLoading(true);
    (async () => {
      try {
        const res = await getPlayerProfile(playerId);
        setProfile(res.data);
      } catch {
        toast.error('Failed to load player profile');
        setProfile(null);
      } finally {
        setCardLoading(false);
      }
    })();
  }, [playerId, mode]);

  useEffect(() => {
    if (mode !== 'team' || !teamId) return;
    setCardLoading(true);
    (async () => {
      try {
        const res = await getTeamSheet(teamId);
        setTeamSheet(res.data);
      } catch {
        toast.error('Failed to load team sheet');
        setTeamSheet(null);
      } finally {
        setCardLoading(false);
      }
    })();
  }, [teamId, mode]);

  const safe = (s) => (s || 'card').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaUserCircle size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Player Profiles</h1>
            <p className="text-white/50 mt-2">Studio-quality player cards & team sheets</p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setMode('player')}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${mode === 'player' ? 'bg-rose-600 text-white' : 'text-white/60'}`}
              >
                <FaIdCard /> Player Card
              </button>
              <button
                onClick={() => setMode('team')}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${mode === 'team' ? 'bg-rose-600 text-white' : 'text-white/60'}`}
              >
                <FaUsers /> Team Sheet
              </button>
            </div>
          </SlideUp>

          {loading ? (
            <div className="max-w-4xl mx-auto"><TableSkeleton rows={6} cols={6} /></div>
          ) : tournaments.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState emoji="🪪" title="No tournaments yet" subtitle="Create a tournament, add teams and register players." />
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
                    <select className="form-select" value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={!teams.length}>
                      {teams.length === 0 ? <option>No teams</option> : teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  {mode === 'player' && (
                    <div>
                      <label className="form-label">Player</label>
                      <select className="form-select" value={playerId} onChange={(e) => setPlayerId(e.target.value)} disabled={!players.length}>
                        {players.length === 0 ? <option>No players</option> : players.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.jersey_number != null ? `#${p.jersey_number} ` : ''}{p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {mode === 'player' && profile && (
                  <ExportButtons
                    elementId="export-player-profile"
                    filename={safe(`${profile.name}-profile`)}
                    tournamentName={profile.name}
                    shareText={`📊 ${profile.name} — ${profile.tournament_name} player card · generated with LTG`}
                    heading="Download player card"
                    subtitle="Share-ready for WhatsApp, Instagram, Facebook & printing."
                  />
                )}
                {mode === 'team' && teamSheet && (
                  <ExportButtons
                    elementId="export-team-sheet"
                    filename={safe(`${teamSheet.team_name}-team-sheet`)}
                    tournamentName={teamSheet.team_name}
                    shareText={`📋 ${teamSheet.team_name} team sheet · ${teamSheet.tournament_name} · generated with LTG`}
                    heading="Download team sheet"
                    subtitle="Squad card with jersey numbers and photos."
                  />
                )}
              </div>

              <div className="lg:col-span-3">
                {cardLoading ? (
                  <div className="glass-card"><TableSkeleton rows={8} cols={4} /></div>
                ) : mode === 'player' ? (
                  !profile ? (
                    <div className="glass-card">
                      <EmptyState emoji="🪪" title="Select a player" subtitle="Pick a team and player to preview the card." />
                    </div>
                  ) : (
                    <ScaleIn className="glass-card p-3 md:p-4 overflow-hidden">
                      <CardPreview>
                        <PlayerProfileCard id="export-player-profile" data={profile} />
                      </CardPreview>
                    </ScaleIn>
                  )
                ) : !teamSheet ? (
                  <div className="glass-card">
                    <EmptyState emoji="📋" title="Select a team" subtitle="Pick a team to preview its team sheet." />
                  </div>
                ) : (
                  <ScaleIn className="glass-card p-3 md:p-4 overflow-hidden">
                    <CardPreview>
                      <TeamSheetCard id="export-team-sheet" data={teamSheet} />
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
