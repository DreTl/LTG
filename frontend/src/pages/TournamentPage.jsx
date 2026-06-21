import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaTrophy } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { getTournaments, createTournament, updateTournament, deleteTournament } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, StaggerGroup, StaggerItem } from '../components/ui/Motion';
import { CardSkeletonGrid } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', season: '', number_of_teams: 0 });

  const fetchTournaments = async () => {
    try {
      const res = await getTournaments();
      setTournaments(res.data);
    } catch (err) {
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateTournament(editing.id, form);
        toast.success('Tournament updated');
      } else {
        await createTournament(form);
        toast.success('Tournament created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', season: '', number_of_teams: 0 });
      fetchTournaments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (tournament) => {
    setEditing(tournament);
    setForm({
      name: tournament.name,
      season: tournament.season,
      number_of_teams: tournament.number_of_teams,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tournament and all its data?')) return;
    try {
      await deleteTournament(id);
      toast.success('Tournament deleted');
      fetchTournaments();
    } catch (err) {
      toast.error('Failed to delete tournament');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', season: '', number_of_teams: 0 });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <SlideUp className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <span className="pill-badge mb-3">Leagues</span>
            <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">Tournaments</h1>
            <p className="text-white/40 mt-2 text-sm">Create and manage leagues</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); }}
            className="btn-ltg btn-ltg-primary px-6 py-3"
          >
            <FaPlus size={12} /> Create Tournament
          </button>
        </SlideUp>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 text-white">
              {editing ? 'Edit Tournament' : 'Create Tournament'}
            </h3>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label dark:text-gray-300">Tournament Name</label>
                <input
                  type="text"
                  className="form-control rounded-xl"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Kinesi Festival Cup 2026"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label dark:text-gray-300">Season</label>
                <input
                  type="text"
                  className="form-control rounded-xl"
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  placeholder="2026"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label dark:text-gray-300">Number of Teams</label>
                <input
                  type="number"
                  min="0"
                  className="form-control rounded-xl"
                  value={form.number_of_teams}
                  onChange={(e) => setForm({ ...form, number_of_teams: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-ltg btn-ltg-primary">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-ltg btn-ltg-ghost">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : tournaments.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              emoji="📊"
              title="Create your first tournament"
              subtitle="Set up a league, add teams, and start generating standings."
              actionLabel="Create Tournament"
              onAction={() => setShowForm(true)}
            />
          </div>
        ) : (
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t) => (
              <StaggerItem key={t.id} className="stat-widget" style={{ minHeight: 'auto' }}>
                <span className="stat-glow" aria-hidden="true" />
                <span className="stat-icon-circle mb-4"><FaTrophy size={18} /></span>
                <h3 className="display-heading text-xl text-white mb-1">{t.name}</h3>
                <p className="text-white/40 text-sm">Season {t.season} · {t.number_of_teams} teams</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link to={`/admin/tournament/${t.id}/teams`} className="btn-ltg btn-ltg-primary px-4 py-1.5 text-sm">
                    Manage
                  </Link>
                  <button onClick={() => handleEdit(t)} className="btn-ltg btn-ltg-ghost px-3 py-1.5 text-sm">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="btn-ltg btn-ltg-danger px-3 py-1.5 text-sm">
                    <FaTrash />
                  </button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </main>
    </div>
  );
}
