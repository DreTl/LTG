import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaStar } from 'react-icons/fa';
import { TournamentSidebar } from '../components/Sidebar';
import PlayerAvatar from '../components/PlayerAvatar';
import { getPlayers, deletePlayer, getTeams, getTournament } from '../services/api';
import { POSITIONS, positionName } from '../utils/positions';
import { toast } from 'react-toastify';
import { SlideUp, StaggerGroup, StaggerItem } from '../components/ui/Motion';
import { CardSkeletonGrid } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function PlayersPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes, tournamentRes] = await Promise.all([
        getPlayers({ tournament_id: tournamentId }),
        getTeams(tournamentId),
        getTournament(tournamentId),
      ]);
      setPlayers(playersRes.data);
      setTeams(teamsRes.data);
      setTournament(tournamentRes.data);
    } catch {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const handleDelete = async (player) => {
    if (!window.confirm(`Delete player "${player.name}"?`)) return;
    try {
      await deletePlayer(player.id);
      toast.success('Player deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete player');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter((p) => {
      if (teamFilter && String(p.team_id) !== String(teamFilter)) return false;
      if (positionFilter && p.position !== positionFilter) return false;
      if (q) {
        const hay = `${p.name} ${p.team_name} ${p.jersey_number ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [players, search, teamFilter, positionFilter]);

  return (
    <div className="flex min-h-screen">
      <TournamentSidebar tournamentId={tournamentId} tournamentName={tournament?.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <SlideUp className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <span className="pill-badge mb-3">Player Center</span>
            <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">Players</h1>
            <p className="text-white/40 mt-2 text-sm">
              Register and manage squads for {tournament?.name}
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/tournament/${tournamentId}/players/new`)}
            className="btn-ltg btn-ltg-primary px-6 py-3"
          >
            <FaPlus size={12} /> Add Player
          </button>
        </SlideUp>

        <div className="glass-card p-4 mb-8 grid gap-3 md:grid-cols-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={13} />
            <input
              type="text"
              className="form-control rounded-xl"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Search name, team or jersey #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select rounded-xl" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select className="form-select rounded-xl" value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
            <option value="">All positions</option>
            {POSITIONS.map((p) => (
              <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <CardSkeletonGrid count={8} height={120} />
        ) : filtered.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              emoji="🏃"
              title={players.length === 0 ? 'No players yet' : 'No players match your filters'}
              subtitle={players.length === 0
                ? 'Register players to start tracking goals, assists and ratings.'
                : 'Try clearing the search or filters.'}
              actionLabel={players.length === 0 ? 'Add Player' : undefined}
              onAction={players.length === 0 ? () => navigate(`/admin/tournament/${tournamentId}/players/new`) : undefined}
            />
          </div>
        ) : (
          <StaggerGroup className="row g-4">
            {filtered.map((player) => (
              <StaggerItem key={player.id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="glass-card p-5 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <PlayerAvatar name={player.name} photo={player.photo} size={56} />
                      {player.jersey_number != null && (
                        <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white shadow">
                          {player.jersey_number}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate flex items-center gap-1">
                        {player.name}
                        {player.captain && <FaStar size={11} className="text-amber-400" title="Captain" />}
                      </h3>
                      <p className="text-white/40 text-xs truncate">{player.team_name}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="pill-badge !text-[10px]">{positionName(player.position)}</span>
                    {player.nationality && (
                      <span className="text-white/40 text-xs self-center">{player.nationality}</span>
                    )}
                    {player.age != null && (
                      <span className="text-white/40 text-xs self-center">{player.age} yrs</span>
                    )}
                  </div>
                  <div className="mt-auto pt-4 flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/tournament/${tournamentId}/players/${player.id}/edit`)}
                      className="btn-ltg btn-ltg-ghost px-3 py-1.5 text-sm flex-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(player)}
                      className="btn-ltg btn-ltg-danger px-3 py-1.5 text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </main>
    </div>
  );
}
