import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { TournamentSidebar } from '../components/Sidebar';
import TeamCard from '../components/TeamCard';
import { getTeams, createTeam, updateTeam, deleteTeam, getTournament } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, StaggerGroup, StaggerItem } from '../components/ui/Motion';
import { CardSkeletonGrid } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function TeamsPage() {
  const { tournamentId } = useParams();
  const [teams, setTeams] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', logo: null });
  const [preview, setPreview] = useState(null);

  const fetchData = async () => {
    try {
      const [teamsRes, tournamentRes] = await Promise.all([
        getTeams(tournamentId),
        getTournament(tournamentId),
      ]);
      setTeams(teamsRes.data);
      setTournament(tournamentRes.data);
    } catch (err) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, logo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('tournament_id', tournamentId);
    formData.append('name', form.name);

    if (form.logo) {
      formData.append('logo', form.logo);
    }

    try {
      if (editing) {
        await updateTeam(editing.id, formData);
        toast.success('Team updated');
      } else {
        await createTeam(formData);
        toast.success('Team created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', logo: null });
      setPreview(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (team) => {
    setEditing(team);
    setForm({ name: team.name, logo: null });
    setPreview(team.logo || null);
    setShowForm(true);
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`Delete team "${team.name}"?`)) return;
    try {
      await deleteTeam(team.id);
      toast.success('Team deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete team');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', logo: null });
    setPreview(null);
  };

  return (
    <div className="flex min-h-screen">
      <TournamentSidebar tournamentId={tournamentId} tournamentName={tournament?.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <SlideUp className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <span className="pill-badge mb-3">Teams</span>
            <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">Teams</h1>
            <p className="text-white/40 mt-2 text-sm">
              Manage teams for {tournament?.name}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); }}
            className="btn-ltg btn-ltg-primary px-6 py-3"
          >
            <FaPlus size={12} /> Add Team
          </button>
        </SlideUp>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 text-white">
              {editing ? 'Edit Team' : 'Add Team'}
            </h3>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label dark:text-gray-300">Team Name</label>
                <input
                  type="text"
                  className="form-control rounded-xl"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Team name"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label dark:text-gray-300">Team Logo</label>
                <input
                  type="file"
                  className="form-control rounded-xl"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {preview && (
                <div className="col-12">
                  <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-ltg btn-ltg-primary">
                {editing ? 'Update' : 'Add'} Team
              </button>
              <button type="button" onClick={cancelForm} className="btn-ltg btn-ltg-ghost">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <CardSkeletonGrid count={8} height={120} />
        ) : teams.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              emoji="⚽"
              title="No teams available"
              subtitle="Add teams to your tournament to start recording matches."
              actionLabel="Add Team"
              onAction={() => setShowForm(true)}
            />
          </div>
        ) : (
          <StaggerGroup className="row g-4">
            {teams.map((team) => (
              <StaggerItem key={team.id} className="col-sm-6 col-md-4 col-lg-3">
                <TeamCard team={team} onEdit={handleEdit} onDelete={handleDelete} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </main>
    </div>
  );
}
