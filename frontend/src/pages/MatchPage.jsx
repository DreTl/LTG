import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TournamentSidebar } from '../components/Sidebar';
import MatchResultsManager from '../components/MatchResultsManager';
import { getTournament } from '../services/api';
import { toast } from 'react-toastify';
import { SlideUp } from '../components/ui/Motion';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function MatchPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await getTournament(tournamentId);
        setTournament(res.data);
      } catch (err) {
        toast.error('Failed to load tournament');
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  return (
    <div className="flex min-h-screen">
      <TournamentSidebar tournamentId={tournamentId} tournamentName={tournament?.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <SlideUp className="mb-10">
          <span className="pill-badge mb-3">Results</span>
          <h1 className="display-heading text-4xl md:text-5xl text-white mt-3">Match Results</h1>
          <p className="text-white/40 mt-2 text-sm">
            Enter, edit, or delete results for {tournament?.name}
          </p>
        </SlideUp>

        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : (
          <MatchResultsManager tournamentId={tournamentId} showAddButton={true} />
        )}
      </main>
    </div>
  );
}
