import { EXPORT_TOTAL_WIDTH, EXPORT_TOTAL_HEIGHT } from '../utils/exportDimensions';
import PlayerAvatar from './PlayerAvatar';
import TeamAvatar from './TeamAvatar';
import { positionName } from '../utils/positions';

const TITLE_FONT = 'Bebas Neue, Anton, Oswald, "Arial Narrow", sans-serif';
const SUB_FONT = 'Oswald, "Arial Narrow", sans-serif';
const NUM_FONT = 'Rajdhani, Oswald, sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';

function StatPill({ label, value, accent }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '22px',
        padding: '22px 10px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: NUM_FONT, fontSize: '62px', fontWeight: 800, color: accent || '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: SUB_FONT, fontSize: '24px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.75)', marginTop: '8px' }}>
        {label}
      </div>
    </div>
  );
}

function formatRange(start, end) {
  if (!start) return '';
  const fmt = (s) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

/** Player of the Week spotlight — fixed 1438 × 1451 export graphic. */
export default function PlayerOfWeekCard({ id, player, weekStart, weekEnd, tournamentName }) {
  if (!player) return null;

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
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.68)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 45% at 50% 8%, rgba(124,58,237,0.30) 0%, transparent 55%),' +
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(225,29,72,0.28) 0%, transparent 55%)',
        }}
      />

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '1180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            padding: '14px 46px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(225,29,72,0.2))',
            border: '1px solid rgba(255,255,255,0.18)',
            fontFamily: TITLE_FONT,
            fontSize: '54px',
            fontWeight: 700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#fff',
            marginBottom: '18px',
          }}
        >
          Player of the Week
        </div>
        <p style={{ fontFamily: SUB_FONT, fontSize: '30px', fontWeight: 300, color: 'rgba(255,255,255,0.75)', margin: '0 0 26px', letterSpacing: '4px', textTransform: 'uppercase' }}>
          {tournamentName}{weekStart ? ` • ${formatRange(weekStart, weekEnd)}` : ''}
        </p>

        <PlayerAvatar
          name={player.name}
          photo={player.photo}
          size={300}
          fontFamily={TITLE_FONT}
          style={{ border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 0 60px rgba(124,58,237,0.4)' }}
        />

        <span style={{ fontFamily: TITLE_FONT, fontSize: '110px', fontWeight: 700, color: '#fff', margin: '20px 0 0', lineHeight: 0.92, letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 4px 18px rgba(0,0,0,0.6)' }}>
          {player.jersey_number != null ? `#${player.jersey_number} ` : ''}{player.name}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px' }}>
          <TeamAvatar logo={player.team_logo} name={player.team_name} size={56} fontFamily={TITLE_FONT} />
          <span style={{ fontFamily: SUB_FONT, fontSize: '36px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
            {player.team_name}
          </span>
          <span style={{ fontFamily: SUB_FONT, fontSize: '30px', fontWeight: 500, color: '#c4b5fd', letterSpacing: '2px', textTransform: 'uppercase' }}>
            • {positionName(player.position)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '18px', width: '100%', marginTop: '34px' }}>
          <StatPill label="Goals" value={player.goals} accent="#4ade80" />
          <StatPill label="Assists" value={player.assists} accent="#60a5fa" />
          <StatPill label="Clean Sheets" value={player.clean_sheets} accent="#34d399" />
          <StatPill label="Week Rating" value={player.week_score} accent="#c4b5fd" />
        </div>
      </div>

      <p style={{ position: 'absolute', bottom: '26px', left: 0, right: 0, textAlign: 'center', fontFamily: SUB_FONT, fontSize: '22px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        Generated with LTG
      </p>
    </div>
  );
}
