import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaFutbol } from 'react-icons/fa';
import { TournamentSidebar } from '../components/Sidebar';
import StandingTable from '../components/StandingTable';
import ExportButtons from '../components/ExportButtons';
import MatchResultsManager from '../components/MatchResultsManager';
import { getStandings, getTournament } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp, ScaleIn } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function GeneratePage() {
  const { tournamentId } = useParams();
  const [standings, setStandings] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    try {
      const res = await getStandings(tournamentId);
      setStandings(res.data);
    } catch (err) {
      toast.error('Failed to load standings');
    }
  }, [tournamentId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentRes = await getTournament(tournamentId);
        setTournament(tournamentRes.data);
        await fetchStandings();
      } catch (err) {
        toast.error('Failed to load tournament');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId, fetchStandings]);

  const handleResultsChange = () => {
    fetchStandings();
  };

  const filename = `${tournament?.name || 'standings'}-${tournament?.season || ''}`
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  const shareUrl = `${window.location.origin}/standings`;

  return (
    <div className="flex min-h-screen">
      <TournamentSidebar tournamentId={tournamentId} tournamentName={tournament?.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-6xl">
        <SlideUp className="mb-10">
          <span className="pill-badge mb-4">Generate & Export</span>
          <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">
            League Table
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            {tournament?.name} · Season {tournament?.season}
          </p>
        </SlideUp>

        {loading ? (
          <div className="mb-8">
            <TableSkeleton rows={8} cols={10} />
          </div>
        ) : standings.length === 0 ? (
          <div className="glass-card mb-8">
            <EmptyState
              emoji="🏆"
              title="No standings yet"
              subtitle="Add teams and record match results below to generate the table."
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <ExportButtons
                elementId="export-standings-table"
                filename={filename}
                tournamentName={tournament?.name}
                shareUrl={shareUrl}
              />
            </div>

            <ScaleIn className="mb-8">
              <StandingTable
                standings={standings}
                tournamentName={tournament?.name}
                season={tournament?.season}
                highlightPositions={true}
                animateRows={true}
              />
            </ScaleIn>

            {/* Off-DOM export source — cloned into viewport during capture */}
            <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
              <StandingTable
                id="export-standings-table"
                standings={standings}
                tournamentName={tournament?.name}
                season={tournament?.season}
                exportMode={true}
                highlightPositions={true}
              />
            </div>
          </>
        )}

        <div className="glass-card p-6 md:p-8 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaFutbol className="text-white/40" />
              <div>
                <h2 className="text-lg font-semibold text-white">Manage Match Results</h2>
                <p className="text-sm text-white/40">
                  Fix mistakes — the table above updates automatically.
                </p>
              </div>
            </div>
            <Link
              to={`/admin/tournament/${tournamentId}/matches`}
              className="btn-ltg btn-ltg-ghost px-4 py-2 text-sm"
            >
              Full matches page →
            </Link>
          </div>
          <MatchResultsManager
            tournamentId={tournamentId}
            showAddButton={true}
            compact={true}
            onResultsChange={handleResultsChange}
          />
        </div>
      </main>
    </div>
  );
}
