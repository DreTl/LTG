import { useEffect, useState, useRef, useCallback, useId } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaFileUpload,
  FaMagic,
  FaFileImage,
  FaFilePdf,
  FaWhatsapp,
  FaPen,
  FaTrash,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaPlus,
  FaClock,
} from 'react-icons/fa';
import { TournamentSidebar } from '../components/Sidebar';
import FixturesGraphic from '../components/FixturesGraphic';
import TeamAvatar from '../components/TeamAvatar';
import { getTournament, getTeams, generateFixtures } from '../services/api';
import { captureGraphicElement } from '../utils/exportGraphic';
import {
  canvasToBlob,
  downloadCanvas,
  downloadCanvasAsPdf,
  shareWithNativeApi,
  openShareWindow,
} from '../utils/exportStandings';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn, FadeIn } from '../components/ui/Motion';
import EmptyState from '../components/ui/EmptyState';

const SEPARATORS = /\s+(?:vs?\.?|v|versus|-|–|—)\s+/i;

// Kickoff slots: 2:00 PM → 4:00 PM in 15-minute steps.
const KICKOFF_SLOTS = (() => {
  const slots = [];
  for (let m = 14 * 60; m <= 16 * 60; m += 15) {
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const suffix = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 || 12;
    slots.push(`${h12}:${String(min).padStart(2, '0')} ${suffix}`);
  }
  return slots;
})();

const randomKickoff = () =>
  KICKOFF_SLOTS[Math.floor(Math.random() * KICKOFF_SLOTS.length)];

function parseTeamsFromText(text) {
  const names = [];
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      // Drop leading bullets / numbering like "1.", "-", "•".
      const cleaned = line.replace(/^[\s\d]*[).\-•*]+\s*/, '').trim();
      if (!cleaned) return;
      if (SEPARATORS.test(cleaned)) {
        cleaned.split(SEPARATORS).forEach((part) => {
          const t = part.trim();
          if (t) names.push(t);
        });
      } else {
        names.push(cleaned);
      }
    });

  const seen = new Set();
  return names.filter((n) => {
    const key = n.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function FixturesPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teamsText, setTeamsText] = useState('');
  const [doubleRound, setDoubleRound] = useState(false);
  const [fixtures, setFixtures] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [editing, setEditing] = useState(null); // { ri, mi }
  const [draft, setDraft] = useState({ home: '', away: '', time: '' });
  const fileInputRef = useRef(null);

  const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, teamsRes] = await Promise.all([
          getTournament(tournamentId),
          getTeams(tournamentId),
        ]);
        setTournament(tRes.data);
        if (teamsRes.data.length) {
          setTeamsText(teamsRes.data.map((t) => t.name).join('\n'));
        }
      } catch (err) {
        toast.error('Failed to load tournament');
      }
    };
    fetchData();
  }, [tournamentId]);

  const extractFromImage = async (file) => {
    const Tesseract = (await import('tesseract.js')).default;
    setOcrProgress(0);
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      },
    });
    return data.text;
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    setImporting(true);
    try {
      let text = '';
      if (ext === 'docx') {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (ext === 'txt' || ext === 'csv') {
        text = await file.text();
        if (ext === 'csv') text = text.replace(/,/g, '\n');
      } else if (IMAGE_EXTS.includes(ext) || file.type.startsWith('image/')) {
        toast.info('Reading text from image…');
        text = await extractFromImage(file);
      } else if (ext === 'doc') {
        toast.error('Legacy .doc not supported — please save as .docx, .txt, or .csv');
        return;
      } else {
        toast.error('Unsupported file. Use a document (.docx/.txt/.csv) or an image');
        return;
      }

      const names = parseTeamsFromText(text);
      if (!names.length) {
        toast.error('No team names found — try a clearer image or check the file');
        return;
      }
      setTeamsText(names.join('\n'));
      toast.success(`Imported ${names.length} teams from ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not read the file');
    } finally {
      setImporting(false);
      setOcrProgress(0);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    const teams = parseTeamsFromText(teamsText);
    if (teams.length < 2) {
      toast.error('Add at least 2 teams');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateFixtures(teams, doubleRound);
      setFixtures(res.data);
      toast.success(`Generated ${res.data.total_rounds} rounds`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate fixtures');
    } finally {
      setGenerating(false);
    }
  };

  const filename = `${tournament?.name || 'fixtures'}-fixtures`
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  const runExport = useCallback(async (action) => {
    setExporting(true);
    try {
      const canvas = await captureGraphicElement('export-fixtures-graphic');
      await action(canvas);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  const teamOptions = parseTeamsFromText(teamsText);

  const recount = (rounds) => ({
    total_rounds: rounds.length,
    total_matches: rounds.reduce((sum, r) => sum + r.matches.length, 0),
  });

  const updateFixtures = (rounds) => {
    setFixtures((prev) => (prev ? { ...prev, rounds, ...recount(rounds) } : prev));
  };

  const startEdit = (ri, mi, match) => {
    setEditing({ ri, mi });
    setDraft({ home: match.home, away: match.away, time: match.time || randomKickoff() });
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft({ home: '', away: '', time: '' });
  };

  const saveEdit = () => {
    const home = draft.home.trim();
    const away = draft.away.trim();
    if (!home || !away) {
      toast.error('Both teams are required');
      return;
    }
    if (home.toLowerCase() === away.toLowerCase()) {
      toast.error('A team cannot play itself');
      return;
    }
    const rounds = fixtures.rounds.map((r, ri) =>
      ri === editing.ri
        ? {
            ...r,
            matches: r.matches.map((m, mi) =>
              mi === editing.mi ? { home, away, time: draft.time } : m
            ),
          }
        : r
    );
    updateFixtures(rounds);
    cancelEdit();
    toast.success('Fixture updated');
  };

  const swapDraft = () => setDraft((d) => ({ home: d.away, away: d.home }));

  const deleteMatch = (ri, mi) => {
    const rounds = fixtures.rounds
      .map((r, idx) =>
        idx === ri ? { ...r, matches: r.matches.filter((_, j) => j !== mi) } : r
      )
      .filter((r) => r.matches.length > 0)
      .map((r, idx) => ({ ...r, round: idx + 1 }));
    updateFixtures(rounds);
    toast.success('Fixture deleted');
  };

  const deleteRound = (ri) => {
    const rounds = fixtures.rounds
      .filter((_, idx) => idx !== ri)
      .map((r, idx) => ({ ...r, round: idx + 1 }));
    updateFixtures(rounds);
    if (editing?.ri === ri) cancelEdit();
    toast.success('Round deleted');
  };

  const addMatch = (ri) => {
    const newMatch = { home: 'Team A', away: 'Team B', time: randomKickoff() };
    const rounds = fixtures.rounds.map((r, idx) =>
      idx === ri ? { ...r, matches: [...r.matches, newMatch] } : r
    );
    updateFixtures(rounds);
    startEdit(ri, fixtures.rounds[ri].matches.length, newMatch);
  };

  const handlePng = () => runExport((c) => { downloadCanvas(c, filename, 'png'); toast.success('PNG downloaded'); });
  const handleJpg = () => runExport((c) => { downloadCanvas(c, filename, 'jpg'); toast.success('JPG downloaded'); });
  const handlePdf = () => runExport(async (c) => { await downloadCanvasAsPdf(c, filename); toast.success('PDF downloaded'); });
  const handleShare = () =>
    runExport(async (c) => {
      const blob = await canvasToBlob(c);
      downloadCanvas(c, filename, 'png');
      const text = `🗓️ ${tournament?.name || 'League'} fixtures — generated with LTG`;
      const shared = await shareWithNativeApi(blob, filename, tournament?.name, text);
      if (!shared) {
        openShareWindow('whatsapp', text, window.location.origin);
        toast.success('PNG saved — opening WhatsApp');
      }
    });

  return (
    <div className="flex min-h-screen">
      <TournamentSidebar tournamentId={tournamentId} tournamentName={tournament?.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-6xl">
        <SlideUp className="mb-10">
          <span className="pill-badge mb-4">Fixtures Generator</span>
          <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">Generate Fixtures</h1>
          <p className="text-white/40 mt-2 text-sm">
            {tournament?.name} · Season {tournament?.season}
          </p>
        </SlideUp>

        <div className="glass-card p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Teams</h2>
              <p className="text-sm text-white/40">
                One team per line. Import a document or a picture, or edit the list below.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.txt,.csv,image/*"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="btn-ltg btn-ltg-ghost px-4 py-2 text-sm"
              >
                <FaFileUpload />{' '}
                {importing
                  ? ocrProgress > 0
                    ? `Reading image… ${ocrProgress}%`
                    : 'Importing…'
                  : 'Import doc or picture'}
              </button>
            </div>
          </div>

          <textarea
            className="form-control"
            rows={8}
            value={teamsText}
            onChange={(e) => setTeamsText(e.target.value)}
            placeholder={'Simba FC\nWarriors FC\nYoung Stars\nUnited FC'}
            style={{ fontFamily: 'var(--font-numeric, monospace)' }}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={doubleRound}
                onChange={(e) => setDoubleRound(e.target.checked)}
              />
              Double round-robin (home &amp; away)
            </label>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-ltg btn-ltg-primary px-5 py-2.5"
            >
              <FaMagic /> {generating ? 'Generating…' : 'Generate Fixtures'}
            </button>
          </div>
        </div>

        {!fixtures ? (
          <div className="glass-card">
            <EmptyState
              emoji="🗓️"
              title="No fixtures yet"
              subtitle="Add teams and hit Generate to build the schedule."
            />
          </div>
        ) : (
          <>
            <div className="glass-card p-6 mb-8">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-5 text-sm text-white/50">
                <span><strong className="text-white">{fixtures.team_count}</strong> teams</span>
                <span><strong className="text-white">{fixtures.total_rounds}</strong> rounds</span>
                <span><strong className="text-white">{fixtures.total_matches}</strong> matches</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={handlePng} disabled={exporting} className="btn-ltg btn-ltg-primary">
                  <FaFileImage /> PNG
                </button>
                <button onClick={handleJpg} disabled={exporting} className="btn-ltg btn-ltg-secondary">
                  <FaFileImage /> JPG
                </button>
                <button onClick={handlePdf} disabled={exporting} className="btn-ltg btn-ltg-danger">
                  <FaFilePdf /> PDF
                </button>
                <button onClick={handleShare} disabled={exporting} className="btn-ltg btn-ltg-success">
                  <FaWhatsapp /> Share
                </button>
                {exporting && (
                  <span className="flex items-center gap-2 text-sm text-white/50">
                    <div className="spinner-border spinner-border-sm" role="status" /> Generating image…
                  </span>
                )}
              </div>
            </div>

            <ScaleIn className="space-y-6">
              {fixtures.rounds.map((round, ri) => (
                <FadeIn key={ri} className="glass-card p-5 md:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-2 text-white font-semibold uppercase tracking-wider">
                      <FaCalendarAlt className="text-rose-400" /> Round {round.round}
                    </span>
                    <span className="flex-1 h-px bg-white/10" />
                    <button
                      onClick={() => addMatch(ri)}
                      className="text-white/40 hover:text-emerald-400 transition-colors p-1.5"
                      title="Add match to this round"
                    >
                      <FaPlus size={13} />
                    </button>
                    <button
                      onClick={() => deleteRound(ri)}
                      className="text-white/40 hover:text-rose-400 transition-colors p-1.5"
                      title="Delete round"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {round.matches.map((m, mi) => {
                      const isEditing = editing?.ri === ri && editing?.mi === mi;
                      if (isEditing) {
                        return (
                          <div
                            key={mi}
                            className="flex flex-col gap-2 rounded-xl border border-rose-400/30 bg-white/[0.05] px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <TeamPicker
                                value={draft.home}
                                options={teamOptions}
                                onChange={(v) => setDraft((d) => ({ ...d, home: v }))}
                              />
                              <button
                                onClick={swapDraft}
                                className="text-white/50 hover:text-white transition-colors p-2"
                                title="Swap home/away"
                              >
                                <FaExchangeAlt size={12} />
                              </button>
                              <TeamPicker
                                value={draft.away}
                                options={teamOptions}
                                onChange={(v) => setDraft((d) => ({ ...d, away: v }))}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <FaClock className="text-white/40" size={12} />
                              <select
                                className="form-select form-select-sm"
                                value={draft.time}
                                onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                                style={{ maxWidth: '140px' }}
                              >
                                {KICKOFF_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={saveEdit}
                                className="btn-ltg btn-ltg-success px-3 py-1.5 text-xs"
                              >
                                <FaCheck size={11} /> Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="btn-ltg btn-ltg-ghost px-3 py-1.5 text-xs"
                              >
                                <FaTimes size={11} /> Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={mi}
                          className="group flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
                        >
                          <span className="flex items-center justify-end gap-2 flex-1 min-w-0">
                            <span className="font-medium text-white truncate text-right">{m.home}</span>
                            <TeamAvatar name={m.home} size={28} fontFamily="inherit" />
                          </span>
                          <span className="flex flex-col items-center px-1">
                            <span className="text-xs font-bold text-rose-400">VS</span>
                            {m.time && (
                              <span className="text-[10px] text-white/40 whitespace-nowrap mt-0.5">{m.time}</span>
                            )}
                          </span>
                          <span className="flex items-center justify-start gap-2 flex-1 min-w-0">
                            <TeamAvatar name={m.away} size={28} fontFamily="inherit" />
                            <span className="font-medium text-white truncate text-left">{m.away}</span>
                          </span>
                          <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(ri, mi, m)}
                              className="text-white/40 hover:text-sky-400 transition-colors p-1.5"
                              title="Edit fixture"
                            >
                              <FaPen size={12} />
                            </button>
                            <button
                              onClick={() => deleteMatch(ri, mi)}
                              className="text-white/40 hover:text-rose-400 transition-colors p-1.5"
                              title="Delete fixture"
                            >
                              <FaTrash size={12} />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </FadeIn>
              ))}
            </ScaleIn>

            {/* Off-DOM export source */}
            <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
              <FixturesGraphic
                id="export-fixtures-graphic"
                title={tournament?.name || 'Fixtures'}
                subtitle={tournament?.season ? `Season ${tournament.season}` : 'Fixtures'}
                rounds={fixtures.rounds}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function TeamPicker({ value, options, onChange }) {
  const listId = useId();
  return (
    <>
      <input
        className="form-control form-control-sm"
        value={value}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Team"
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
