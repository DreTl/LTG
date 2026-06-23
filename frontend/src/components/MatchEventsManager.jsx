import { useEffect, useState } from 'react';
import { FaTimes, FaFutbol, FaShoePrints, FaSquare, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PlayerAvatar from './PlayerAvatar';
import { getPlayers, getMatchEvents, saveMatchEvents } from '../services/api';

const BLANK = { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, clean_sheet: false, minutes_played: 0 };

function NumberField({ label, icon: Icon, value, onChange, color }) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wide text-white/40 flex items-center gap-1">
        {Icon && <Icon size={10} style={{ color }} />} {label}
      </span>
      <input
        type="number"
        min="0"
        className="form-control rounded-lg text-center"
        style={{ width: '64px', padding: '4px 6px' }}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      />
    </label>
  );
}

function TeamBlock({ title, players, rows, setRow }) {
  return (
    <div className="glass-card p-4">
      <h4 className="font-semibold text-white mb-3">{title}</h4>
      {players.length === 0 ? (
        <p className="text-white/40 text-sm">No players registered for this team yet.</p>
      ) : (
        <div className="space-y-2">
          {players.map((p) => {
            const row = rows[p.id] || BLANK;
            const update = (patch) => setRow(p.id, { ...row, ...patch });
            return (
              <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <PlayerAvatar name={p.name} photo={p.photo} size={36} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {p.jersey_number != null ? `#${p.jersey_number} ` : ''}{p.name}
                    </p>
                    <p className="text-[11px] text-white/40">{p.position}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <NumberField label="Goals" icon={FaFutbol} color="#4ade80" value={row.goals} onChange={(v) => update({ goals: v })} />
                  <NumberField label="Assists" icon={FaShoePrints} color="#60a5fa" value={row.assists} onChange={(v) => update({ assists: v })} />
                  <NumberField label="YC" icon={FaSquare} color="#facc15" value={row.yellow_cards} onChange={(v) => update({ yellow_cards: v })} />
                  <NumberField label="RC" icon={FaSquare} color="#f87171" value={row.red_cards} onChange={(v) => update({ red_cards: v })} />
                  <NumberField label="Mins" value={row.minutes_played} onChange={(v) => update({ minutes_played: v })} />
                  <label className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-wide text-white/40 flex items-center gap-1">
                      <FaShieldAlt size={10} style={{ color: '#34d399' }} /> CS
                    </span>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      style={{ width: '20px', height: '20px' }}
                      checked={row.clean_sheet}
                      onChange={(e) => update({ clean_sheet: e.target.checked })}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MatchEventsManager({ match, onClose, onSaved }) {
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [homeRes, awayRes, eventsRes] = await Promise.all([
          getPlayers({ team_id: match.home_team_id }),
          getPlayers({ team_id: match.away_team_id }),
          getMatchEvents(match.id),
        ]);
        setHomePlayers(homeRes.data);
        setAwayPlayers(awayRes.data);
        const initial = {};
        eventsRes.data.forEach((ev) => {
          initial[ev.player_id] = {
            goals: ev.goals,
            assists: ev.assists,
            yellow_cards: ev.yellow_cards,
            red_cards: ev.red_cards,
            clean_sheet: ev.clean_sheet,
            minutes_played: ev.minutes_played,
          };
        });
        setRows(initial);
      } catch {
        toast.error('Failed to load match events');
      } finally {
        setLoading(false);
      }
    })();
  }, [match]);

  const setRow = (playerId, value) => setRows((prev) => ({ ...prev, [playerId]: value }));

  const handleSave = async () => {
    setSaving(true);
    const events = Object.entries(rows)
      .map(([player_id, r]) => ({ player_id: Number(player_id), ...r }))
      .filter((r) =>
        r.goals || r.assists || r.yellow_cards || r.red_cards || r.clean_sheet || r.minutes_played
      );
    try {
      await saveMatchEvents(match.id, events);
      toast.success('Player events saved — season stats updated');
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save events');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#160606] p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="display-heading text-2xl text-white">Match Events</h3>
            <p className="text-white/50 text-sm mt-1">
              {match.home_team_name} {match.home_goals}–{match.away_goals} {match.away_team_name}
              {match.played_date ? ` · ${match.played_date}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <FaTimes size={16} />
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-white/50">Loading players…</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <TeamBlock title={match.home_team_name} players={homePlayers} rows={rows} setRow={setRow} />
              <TeamBlock title={match.away_team_name} players={awayPlayers} rows={rows} setRow={setRow} />
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSave} disabled={saving} className="btn-ltg btn-ltg-primary">
                {saving ? 'Saving…' : 'Save Events'}
              </button>
              <button onClick={onClose} className="btn-ltg btn-ltg-ghost">Cancel</button>
            </div>
            <p className="text-xs text-white/30 mt-3">
              Tip: leave a player blank if they didn't feature. Saving recalculates goals, assists, ratings and Player of the Week.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
