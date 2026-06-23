import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { TournamentSidebar } from '../components/Sidebar';
import PlayerAvatar from '../components/PlayerAvatar';
import {
  getTeams,
  getTournament,
  getPlayer,
  createPlayer,
  updatePlayer,
} from '../services/api';
import { POSITIONS } from '../utils/positions';
import { toast } from 'react-toastify';
import { SlideUp } from '../components/ui/Motion';

const EMPTY = {
  team_id: '',
  name: '',
  position: 'ST',
  jersey_number: '',
  age: '',
  nationality: '',
  captain: false,
};

export default function AddPlayerPage() {
  const { tournamentId, playerId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(playerId);

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [teamsRes, tournamentRes] = await Promise.all([
          getTeams(tournamentId),
          getTournament(tournamentId),
        ]);
        setTeams(teamsRes.data);
        setTournament(tournamentRes.data);

        if (editing) {
          const res = await getPlayer(playerId);
          const p = res.data;
          setForm({
            team_id: String(p.team_id),
            name: p.name,
            position: p.position,
            jersey_number: p.jersey_number ?? '',
            age: p.age ?? '',
            nationality: p.nationality ?? '',
            captain: p.captain,
          });
          setPreview(p.photo || null);
        } else if (teamsRes.data.length) {
          setForm((f) => ({ ...f, team_id: String(teamsRes.data[0].id) }));
        }
      } catch {
        toast.error('Failed to load form data');
      }
    })();
  }, [tournamentId, playerId, editing]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.team_id) {
      toast.error('Please select a team');
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append('team_id', form.team_id);
    fd.append('name', form.name);
    fd.append('position', form.position);
    fd.append('jersey_number', form.jersey_number);
    fd.append('age', form.age);
    fd.append('nationality', form.nationality);
    fd.append('captain', form.captain ? 'true' : 'false');
    if (photo) fd.append('photo', photo);

    try {
      if (editing) {
        await updatePlayer(playerId, fd);
        toast.success('Player updated');
      } else {
        await createPlayer(fd);
        toast.success('Player registered');
      }
      navigate(`/admin/tournament/${tournamentId}/players`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <TournamentSidebar tournamentId={tournamentId} tournamentName={tournament?.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <SlideUp className="mb-8">
          <button
            onClick={() => navigate(`/admin/tournament/${tournamentId}/players`)}
            className="mb-3 inline-flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white"
          >
            <FaChevronLeft size={10} /> Players
          </button>
          <h1 className="display-heading text-4xl md:text-5xl text-white">
            {editing ? 'Edit Player' : 'Add Player'}
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            {editing ? 'Update player details' : 'Register a player for a team'}
          </p>
        </SlideUp>

        <form onSubmit={handleSubmit} className="glass-card p-6 max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <PlayerAvatar name={form.name} photo={preview} size={80} />
            <div className="flex-1">
              <label className="form-label dark:text-gray-300">Photo (optional)</label>
              <input type="file" className="form-control rounded-xl" accept="image/*" onChange={handlePhoto} />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label dark:text-gray-300">Team</label>
              <select
                className="form-select rounded-xl"
                value={form.team_id}
                onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                required
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label dark:text-gray-300">Player Name</label>
              <input
                type="text"
                className="form-control rounded-xl"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label dark:text-gray-300">Position</label>
              <select
                className="form-select rounded-xl"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              >
                {POSITIONS.map((p) => (
                  <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label dark:text-gray-300">Jersey Number</label>
              <input
                type="number"
                min="0"
                className="form-control rounded-xl"
                value={form.jersey_number}
                onChange={(e) => setForm({ ...form, jersey_number: e.target.value })}
                placeholder="e.g. 10"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label dark:text-gray-300">Age (optional)</label>
              <input
                type="number"
                min="0"
                className="form-control rounded-xl"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 24"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label dark:text-gray-300">Nationality (optional)</label>
              <input
                type="text"
                className="form-control rounded-xl"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                placeholder="e.g. Tanzania"
              />
            </div>
            <div className="col-12">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.captain}
                  onChange={(e) => setForm({ ...form, captain: e.target.checked })}
                />
                Team captain
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button type="submit" disabled={saving} className="btn-ltg btn-ltg-primary">
              {saving ? 'Saving…' : editing ? 'Update Player' : 'Register Player'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/tournament/${tournamentId}/players`)}
              className="btn-ltg btn-ltg-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
