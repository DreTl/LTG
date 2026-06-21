const NUM_FONT = 'Rajdhani, Oswald, sans-serif';
const LABEL_FONT = 'Oswald, "Arial Narrow", sans-serif';

function StatCard({ label, value, accent, cardHeight, numberSize, labelSize }) {
  return (
    <div
      style={{
        height: `${cardHeight}px`,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontFamily: NUM_FONT,
          fontSize: `${numberSize}px`,
          fontWeight: 800,
          color: accent || '#ffffff',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: LABEL_FONT,
          fontSize: `${labelSize}px`,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * 8-card glassmorphism statistics grid. Inline-styled for html2canvas export.
 */
export default function TeamStatsGrid({
  stats,
  columns = 4,
  gap = 18,
  cardHeight = 160,
  numberSize = 72,
  labelSize = 30,
}) {
  const cards = [
    { key: 'matches', label: 'Matches', value: stats.matches },
    { key: 'wins', label: 'Wins', value: stats.wins, accent: '#4ade80' },
    { key: 'draws', label: 'Draws', value: stats.draws, accent: '#facc15' },
    { key: 'losses', label: 'Losses', value: stats.losses, accent: '#f87171' },
    { key: 'gf', label: 'Goals For', value: stats.goals_for },
    { key: 'ga', label: 'Goals Against', value: stats.goals_against },
    { key: 'gd', label: 'Goal Diff', value: (stats.goal_difference > 0 ? '+' : '') + stats.goal_difference },
    { key: 'pts', label: 'Points', value: stats.points, accent: '#fb7185' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        width: '100%',
      }}
    >
      {cards.map((c) => (
        <StatCard
          key={c.key}
          label={c.label}
          value={c.value}
          accent={c.accent}
          cardHeight={cardHeight}
          numberSize={numberSize}
          labelSize={labelSize}
        />
      ))}
    </div>
  );
}
