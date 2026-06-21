import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory, FaTrash, FaDownload, FaArrowLeft } from 'react-icons/fa';
import Footer from '../components/Footer';
import { getCardHistory, deleteCardFromHistory, clearCardHistory } from '../utils/cardHistory';
import { SlideUp, StaggerGroup, StaggerItem } from '../components/ui/Motion';
import EmptyState from '../components/ui/EmptyState';
import { toast } from 'react-toastify';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function TeamProfileHistory() {
  const [items, setItems] = useState(() => getCardHistory());

  const handleDelete = (id) => {
    setItems(deleteCardFromHistory(id));
    toast.success('Removed from history');
  };

  const handleClear = () => {
    clearCardHistory();
    setItems([]);
    toast.success('History cleared');
  };

  const handleDownload = (item) => {
    const link = document.createElement('a');
    link.href = item.thumb;
    link.download = `${(item.team_name || 'team').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-card.jpg`;
    link.click();
  };

  return (
    <>
      <section className="admin-shell py-12 platform-bg min-h-screen">
        <div className="container mx-auto px-4">
          <SlideUp className="text-center mb-8">
            <span className="stat-icon-circle mx-auto mb-4"><FaHistory size={20} /></span>
            <h1 className="display-heading text-4xl md:text-5xl text-white">Card History</h1>
            <p className="text-white/50 mt-2">Previously generated team profile cards (saved on this device)</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link to="/team-profile" className="btn-ltg btn-ltg-ghost px-4 py-2 text-sm">
                <FaArrowLeft /> Back to generator
              </Link>
              {items.length > 0 && (
                <button onClick={handleClear} className="btn-ltg btn-ltg-danger px-4 py-2 text-sm">
                  <FaTrash /> Clear all
                </button>
              )}
            </div>
          </SlideUp>

          {items.length === 0 ? (
            <div className="glass-card max-w-2xl mx-auto">
              <EmptyState emoji="🗂️" title="No cards yet" subtitle="Generate and export a team card to see it here." />
            </div>
          ) : (
            <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {items.map((item) => (
                <StaggerItem key={item.id} className="glass-card p-3 group">
                  <div className="rounded-xl overflow-hidden mb-3 bg-black/30">
                    <img src={item.thumb} alt={item.team_name} className="w-full block" />
                  </div>
                  <div className="px-1 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">{item.team_name}</span>
                      {item.position && <span className="ltg-pos ltg-pos-default text-xs">#{item.position}</span>}
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">{item.tournament_name}</p>
                    <p className="text-[11px] text-white/30 mt-1">{formatDate(item.createdAt)}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleDownload(item)} className="btn-ltg btn-ltg-ghost px-3 py-1.5 text-xs flex-1">
                        <FaDownload /> Save
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="btn-ltg btn-ltg-danger px-3 py-1.5 text-xs">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
