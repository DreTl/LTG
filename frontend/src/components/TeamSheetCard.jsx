import { EXPORT_TOTAL_WIDTH, EXPORT_TOTAL_HEIGHT } from '../utils/exportDimensions';
import PlayerAvatar from './PlayerAvatar';
import TeamAvatar from './TeamAvatar';

const TITLE_FONT = 'Bebas Neue, Anton, Oswald, "Arial Narrow", sans-serif';
const SUB_FONT = 'Oswald, "Arial Narrow", sans-serif';
const NUM_FONT = 'Rajdhani, Oswald, sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';

function PlayerChip({ player }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '8px 14px' }}>
      <PlayerAvatar name={player.name} photo={player.photo} size={48} fontFamily={TITLE_FONT} />
      <span style={{ fontFamily: NUM_FONT, fontSize: '34px', fontWeight: 800, color: '#fb7185', minWidth: '44px' }}>
        {player.jersey_number != null ? player.jersey_number : '–'}
      </span>
      <span style={{ fontFamily: SUB_FONT, fontSize: '30px', fontWeight: 500, color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {player.name}{player.captain ? ' (C)' : ''}
      </span>
    </div>
  );
}

function Section({ title, players }) {
  if (!players || players.length === 0) return null;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontFamily: SUB_FONT, fontSize: '28px', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', color: '#fb7185', marginBottom: '12px', borderBottom: '2px solid rgba(251,113,133,0.3)', paddingBottom: '6px' }}>
        {title} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({players.length})</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {players.map((p) => <PlayerChip key={p.id} player={p} />)}
      </div>
    </div>
  );
}

/** Team Sheet squad card — fixed 1438 × 1451 export graphic. */
export default function TeamSheetCard({ id, data }) {
  if (!data) return null;

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
        padding: '60px 70px',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 45% at 50% 0%, rgba(225,29,72,0.22) 0%, transparent 55%)' }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
          <TeamAvatar logo={data.team_logo} name={data.team_name} size={120} fontFamily={TITLE_FONT} />
          <div>
            <h1 style={{ fontFamily: TITLE_FONT, fontSize: '92px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 0.9, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {data.team_name}
            </h1>
            <p style={{ fontFamily: SUB_FONT, fontSize: '30px', fontWeight: 300, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Team Sheet • {data.tournament_name} {data.season}
            </p>
          </div>
        </div>
        <div style={{ height: '6px', width: '100%', borderRadius: '20px', background: 'linear-gradient(90deg, #E11D48 0%, #FB7185 50%, #E11D48 100%)', marginBottom: '26px' }} />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Section title="Goalkeepers" players={data.goalkeepers} />
          <Section title="Defenders" players={data.defenders} />
          <Section title="Midfielders" players={data.midfielders} />
          <Section title="Forwards" players={data.forwards} />
        </div>

        <p style={{ textAlign: 'center', fontFamily: SUB_FONT, fontSize: '22px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '10px 0 0' }}>
          {data.total_players} players • Generated with LTG
        </p>
      </div>
    </div>
  );
}
