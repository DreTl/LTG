import { useEffect, useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const emptyForm = () => ({
  home_team_id: '',
  away_team_id: '',
  home_goals: 0,
  away_goals: 0,
  played_date: new Date().toISOString().split('T')[0],
});

export default function MatchForm({ teams, match, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (match) {
      setForm({
        home_team_id: match.home_team_id || '',
        away_team_id: match.away_team_id || '',
        home_goals: match.home_goals ?? 0,
        away_goals: match.away_goals ?? 0,
        played_date: match.played_date || new Date().toISOString().split('T')[0],
      });
    } else {
      setForm(emptyForm());
    }
  }, [match]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (String(form.home_team_id) === String(form.away_team_id)) {
      toast.error('Home and away teams must be different');
      return;
    }
    onSubmit({
      ...form,
      home_team_id: parseInt(form.home_team_id, 10),
      away_team_id: parseInt(form.away_team_id, 10),
      home_goals: parseInt(form.home_goals, 10),
      away_goals: parseInt(form.away_goals, 10),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-6 border border-blue-500/20"
    >
      <h4 className="font-semibold mb-1 text-white">
        {match ? 'Edit Match Result' : 'Add Match Result'}
      </h4>
      {match && (
        <p className="text-sm text-white/40 mb-4">
          Fix wrong scores, teams, or date. Standings will update immediately.
        </p>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label dark:text-gray-300">Home Team</label>
          <select
            className="form-select rounded-lg"
            value={form.home_team_id}
            onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
            required
          >
            <option value="">Select home team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label dark:text-gray-300">Away Team</label>
          <select
            className="form-select rounded-lg"
            value={form.away_team_id}
            onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
            required
          >
            <option value="">Select away team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label dark:text-gray-300">Home Goals</label>
          <input
            type="number"
            min="0"
            className="form-control rounded-lg"
            value={form.home_goals}
            onChange={(e) => setForm({ ...form, home_goals: e.target.value })}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label dark:text-gray-300">Away Goals</label>
          <input
            type="number"
            min="0"
            className="form-control rounded-lg"
            value={form.away_goals}
            onChange={(e) => setForm({ ...form, away_goals: e.target.value })}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label dark:text-gray-300">Match Date</label>
          <input
            type="date"
            className="form-control rounded-lg"
            value={form.played_date}
            onChange={(e) => setForm({ ...form, played_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button type="submit" className="btn-ltg btn-ltg-primary flex items-center gap-2">
          <FaSave /> {match ? 'Save Changes' : 'Save Match'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline-secondary rounded-lg flex items-center gap-2"
          >
            <FaTimes /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}
