import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MatchForm from './MatchForm';
import TeamAvatar from './TeamAvatar';
import {
  getMatches,
  getTeams,
  createMatch,
  updateMatch,
  deleteMatch,
} from '../services/api';

export default function MatchResultsManager({
  tournamentId,
  showAddButton = true,
  compact = false,
  onResultsChange,
}) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        getMatches(tournamentId),
        getTeams(tournamentId),
      ]);
      setMatches(matchesRes.data);
      setTeams(teamsRes.data);
      onResultsChange?.();
    } catch (err) {
      toast.error('Failed to load match results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      setLoading(true);
      fetchData();
    }
  }, [tournamentId]);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateMatch(editing.id, data);
        toast.success('Match result updated — standings recalculated');
      } else {
        await createMatch({ ...data, tournament_id: parseInt(tournamentId) });
        toast.success('Match result saved');
      }
      setShowForm(false);
      setEditing(null);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (match) => {
    setEditing(match);
    setShowForm(true);
    setDeleting(null);
    setTimeout(() => {
      document.getElementById('match-edit-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const confirmDelete = (match) => {
    setDeleting(match);
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMatch(deleting.id);
      toast.success('Match result deleted — standings recalculated');
      setDeleting(null);
      await fetchData();
    } catch (err) {
      toast.error('Failed to delete match result');
    }
  };

  if (loading) {
    return (
      <div className="spinner-overlay py-8">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const logoByName = teams.reduce((acc, t) => {
    acc[t.name] = t.logo;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="alert alert-info rounded-xl flex items-start gap-3 border-0 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
        <FaExclamationTriangle className="mt-1 shrink-0" />
        <div>
          <strong>Correct entry mistakes</strong>
          <p className="mb-0 text-sm mt-1 opacity-90">
            Wrong score or wrong teams? Use <strong>Edit</strong> to fix a result or <strong>Delete</strong> to remove it.
            Standings update automatically after every change.
          </p>
        </div>
      </div>

      {showAddButton && teams.length >= 2 && !showForm && (
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="btn-ltg btn-ltg-primary"
        >
          + Add Match Result
        </button>
      )}

      {teams.length < 2 && (
        <div className="alert alert-warning rounded-xl">
          Add at least 2 teams before entering or editing match results.
        </div>
      )}

      {showForm && teams.length >= 2 && (
        <div id="match-edit-form">
          <MatchForm
            teams={teams}
            match={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {deleting && (
        <div className="glass-card p-6 border border-red-500/30">
          <h4 className="font-semibold text-red-400 mb-2">Delete this result?</h4>
          <p className="text-white/70 mb-1">
            <strong className="text-white">{deleting.home_team_name}</strong> {deleting.home_goals} – {deleting.away_goals}{' '}
            <strong className="text-white">{deleting.away_team_name}</strong>
          </p>
          <p className="text-sm text-white/40 mb-4">
            Date: {deleting.played_date || '—'}. Standings will be recalculated.
          </p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="btn btn-danger rounded-lg">
              Yes, Delete Result
            </button>
            <button onClick={() => setDeleting(null)} className="btn btn-outline-secondary rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-8 text-white/40 glass-card">
          <p>No match results yet.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-white/30">
                  <th className="p-3 md:p-4 font-medium">Date</th>
                  <th className="p-3 md:p-4 font-medium">Home</th>
                  <th className="p-3 md:p-4 text-center font-medium">Score</th>
                  <th className="p-3 md:p-4 font-medium">Away</th>
                  <th className="p-3 md:p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr
                    key={match.id}
                    className={`border-t border-white/5 ${
                      editing?.id === match.id ? 'bg-white/5' : ''
                    }`}
                  >
                    <td className="p-3 md:p-4 text-white/50 text-sm">
                      {match.played_date || '—'}
                    </td>
                    <td className="p-3 md:p-4 font-medium text-white">
                      <span className="flex items-center gap-2">
                        <TeamAvatar
                          name={match.home_team_name}
                          logo={logoByName[match.home_team_name]}
                          size={28}
                          fontFamily="inherit"
                        />
                        <span className="truncate">{match.home_team_name}</span>
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-center font-bold text-white">
                      {match.home_goals} – {match.away_goals}
                    </td>
                    <td className="p-3 md:p-4 font-medium text-white">
                      <span className="flex items-center gap-2">
                        <TeamAvatar
                          name={match.away_team_name}
                          logo={logoByName[match.away_team_name]}
                          size={28}
                          fontFamily="inherit"
                        />
                        <span className="truncate">{match.away_team_name}</span>
                      </span>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(match)}
                          className="btn btn-sm btn-primary rounded-lg flex items-center gap-1"
                          title="Edit this result"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(match)}
                          className="btn btn-sm btn-outline-danger rounded-lg flex items-center gap-1"
                          title="Delete this result"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!compact && matches.length > 0 && (
        <p className="text-sm text-white/40">
          {matches.length} result{matches.length !== 1 ? 's' : ''} recorded. Edit or delete any row to fix mistakes.
        </p>
      )}
    </div>
  );
}
