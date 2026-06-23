import { EXPORT_TOTAL_WIDTH, EXPORT_TOTAL_HEIGHT } from '../utils/exportDimensions';
import TeamAvatar from './TeamAvatar';
import PlayerAvatar from './PlayerAvatar';

const TITLE_FONT = 'Bebas Neue, Anton, Oswald, "Arial Narrow", sans-serif';
const SUB_FONT = 'Oswald, "Arial Narrow", sans-serif';
const NUM_FONT = 'Rajdhani, Oswald, sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';

const RANK_COLORS = {
  1: { bg: 'linear-gradient(135deg,#ffd700,#f0b400)', color: '#1a1a1a' },
  2: { bg: 'linear-gradient(135deg,#e2e8f0,#94a3b8)', color: '#1a1a1a' },
  3: { bg: 'linear-gradient(135deg,#cd7f32,#a96322)', color: '#fff' },
};

function Row({ player, highlight }) {
  const rc = RANK_COLORS[player.rank];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: highlight ? '18px 24px' : '12px 24px',
        borderRadius: '20px',
        background: highlight
          ? 'linear-gradient(90deg, rgba(255,215,0,0.18), rgba(255,215,0,0.04))'
          : 'rgba(255,255,255,0.04)',
        border: highlight ? '2px solid rgba(255,215,0,0.45)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: highlight ? '0 0 30px rgba(255,215,0,0.2)' : 'none',
      }}
    >
      <span
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: rc ? rc.bg : 'rgba(255,255,255,0.08)',
          color: rc ? rc.color : '#fff',
          fontFamily: NUM_FONT,
          fontSize: '36px',
          fontWeight: 800,
        }}
      >
        {player.rank}
      </span>
      <PlayerAvatar name={player.name} photo={player.photo} size={highlight ? 80 : 60} fontFamily={TITLE_FONT} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: SUB_FONT, fontSize: highlight ? '46px' : '38px', fontWeight: 600, color: '#fff', lineHeight: 1.05, textTransform: 'uppercase' }}>
          {player.jersey_number != null ? `#${player.jersey_number} ` : ''}{player.name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <TeamAvatar logo={player.team_logo} name={player.team_name} size={30} fontFamily={TITLE_FONT} />
          <span style={{ fontFamily: SUB_FONT, fontSize: '26px', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
            {player.team_name}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: NUM_FONT, fontSize: highlight ? '64px' : '52px', fontWeight: 800, color: '#fde047', lineHeight: 1 }}>
            {player.goals}
          </div>
          <div style={{ fontFamily: SUB_FONT, fontSize: '20px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Goals
          </div>
        </div>
        <div style={{ textAlign: 'center', minWidth: '70px' }}>
          <div style={{ fontFamily: NUM_FONT, fontSize: '40px', fontWeight: 700, color: '#60a5fa', lineHeight: 1 }}>
            {player.assists}
          </div>
          <div style={{ fontFamily: SUB_FONT, fontSize: '18px', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Assists
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Golden Boot / Top Scorers ranking graphic — fixed 1438 × 1451.
 * `players` should already be ranked (rank, name, team_name, team_logo, goals, assists).
 */
export default function ScorersCard({ id, title = 'Top Scorers', subtitle, players = [], season }) {
  const list = players.slice(0, 10);

  return (
    <div
      id={id}
      style={{
        width: `${EXPORT_TOTAL_WIDTH}px`,
        height: `${EXPORT_TOTAL_HEIGHT}px`,
        minWidth: `${EXPORT_TOTAL_WIDTH}px`,
        minHeight: `${EXPORT_TOTAL_HEIGHT}px`,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0b1120',
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        fontFamily: SUB_FONT,
        padding: '64px 70px',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,215,0,0.18) 0%, transparent 55%),' +
            'radial-gradient(ellipse 55% 45% at 90% 100%, rgba(225,29,72,0.22) 0%, transparent 55%)',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              height: '8px',
              width: '220px',
              margin: '0 auto 14px',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, #ffd700 0%, #fb7185 100%)',
              boxShadow: '0 0 18px rgba(255,215,0,0.45)',
            }}
          />
          <h1 style={{ fontFamily: TITLE_FONT, fontSize: '104px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 0.9, letterSpacing: '3px', textTransform: 'uppercase', textShadow: '0 4px 18px rgba(0,0,0,0.6)' }}>
            {title}
          </h1>
          <p style={{ fontFamily: SUB_FONT, fontSize: '30px', fontWeight: 300, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', letterSpacing: '4px', textTransform: 'uppercase' }}>
            {subtitle || (season ? `Season ${season}` : 'Race for the boot')}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'flex-start' }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '32px', marginTop: '120px' }}>
              No goals recorded yet
            </div>
          ) : (
            list.map((p) => <Row key={p.id} player={p} highlight={p.rank === 1} />)
          )}
        </div>

        <p style={{ textAlign: 'center', fontFamily: SUB_FONT, fontSize: '22px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '16px 0 0' }}>
          Generated with LTG
        </p>
      </div>
    </div>
  );
}
