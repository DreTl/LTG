import { EXPORT_TOTAL_WIDTH, EXPORT_TOTAL_HEIGHT } from '../utils/exportDimensions';
import PlayerAvatar from './PlayerAvatar';
import TeamAvatar from './TeamAvatar';
import { positionName } from '../utils/positions';

const TITLE_FONT = 'Bebas Neue, Anton, Oswald, "Arial Narrow", sans-serif';
const SUB_FONT = 'Oswald, "Arial Narrow", sans-serif';
const NUM_FONT = 'Rajdhani, Oswald, sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';

function formatDate() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        height: '150px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontFamily: NUM_FONT, fontSize: '64px', fontWeight: 800, color: accent || '#fff', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: SUB_FONT, fontSize: '24px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>
        {label}
      </span>
    </div>
  );
}

const FORM_COLOR = { goal: '#4ade80', assist: '#60a5fa', blank: 'rgba(255,255,255,0.12)' };

/** Player Profile Card — fixed 1438 × 1451 export graphic. */
export default function PlayerProfileCard({ id, data }) {
  if (!data) return null;

  const rating = Math.round(data.player_rating || 0);

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
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.66)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 65% 50% at 12% 90%, rgba(225,29,72,0.32) 0%, transparent 58%),' +
            'radial-gradient(ellipse 55% 45% at 90% 10%, rgba(244,63,94,0.26) 0%, transparent 55%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            height: '8px',
            width: '100%',
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #E11D48 0%, #FB7185 50%, #E11D48 100%)',
            boxShadow: '0 0 18px rgba(225,29,72,0.45)',
            marginBottom: '12px',
          }}
        />
        <h1
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '118px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            lineHeight: 0.92,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textShadow: '0 4px 18px rgba(0,0,0,0.6), 0 0 50px rgba(225,29,72,0.30)',
          }}
        >
          Player Profile
        </h1>
        <p style={{ fontFamily: SUB_FONT, fontSize: '32px', fontWeight: 300, color: 'rgba(255,255,255,0.8)', margin: '2px 0 24px', letterSpacing: '4px', textTransform: 'uppercase' }}>
          {data.tournament_name} • {formatDate()}
        </p>

        {/* Identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '34px', marginBottom: '14px', width: '100%' }}>
          <div style={{ position: 'relative' }}>
            <PlayerAvatar
              name={data.name}
              photo={data.photo}
              size={210}
              fontFamily={TITLE_FONT}
              style={{ border: '3px solid rgba(255,255,255,0.18)', boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}
            />
            {data.jersey_number != null && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  right: '-6px',
                  minWidth: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#E11D48,#9f1239)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: NUM_FONT,
                  fontSize: '38px',
                  fontWeight: 800,
                  color: '#fff',
                  border: '3px solid #160606',
                }}
              >
                {data.jersey_number}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: SUB_FONT, fontSize: '28px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: '#fb7185', marginBottom: '4px' }}>
              {positionName(data.position)}{data.captain ? ' • Captain' : ''}
            </span>
            <span
              style={{
                fontFamily: TITLE_FONT,
                fontSize: '96px',
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#ffffff',
                textShadow: '0 3px 14px rgba(0,0,0,0.55)',
              }}
            >
              {data.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
              <TeamAvatar logo={data.team_logo} name={data.team_name} size={56} fontFamily={TITLE_FONT} />
              <span style={{ fontFamily: SUB_FONT, fontSize: '34px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                {data.team_name}
              </span>
            </div>
          </div>

          {/* Rating dial */}
          <div
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'conic-gradient(#fb7185 ' + rating + '%, rgba(255,255,255,0.1) 0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '124px', height: '124px', borderRadius: '50%', background: '#160606', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: NUM_FONT, fontSize: '54px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{rating}</span>
              <span style={{ fontFamily: SUB_FONT, fontSize: '18px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Rating</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginTop: '14px' }}>
          <StatCard label="Goals" value={data.goals} accent="#4ade80" />
          <StatCard label="Assists" value={data.assists} accent="#60a5fa" />
          <StatCard label="Matches" value={data.matches_played} />
          <StatCard label="Yellow Cards" value={data.yellow_cards} accent="#facc15" />
          <StatCard label="Red Cards" value={data.red_cards} accent="#f87171" />
          <StatCard label="Clean Sheets" value={data.clean_sheets} accent="#34d399" />
        </div>

        {/* Recent form */}
        <div style={{ width: '100%', marginTop: '26px', textAlign: 'center' }}>
          <div style={{ fontFamily: SUB_FONT, fontSize: '26px', fontWeight: 600, letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>
            Recent Form
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            {(data.recent_form && data.recent_form.length
              ? data.recent_form
              : [null, null, null, null, null]
            ).slice(0, 5).map((f, i) => {
              const has = f && (f.goals || f.assists || f.clean_sheet);
              const color = !f ? FORM_COLOR.blank : f.goals ? FORM_COLOR.goal : f.assists ? FORM_COLOR.assist : 'rgba(255,255,255,0.25)';
              const label = !f ? '–' : f.goals ? `${f.goals}G` : f.assists ? `${f.assists}A` : f.clean_sheet ? 'CS' : '·';
              return (
                <span
                  key={i}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: has ? color : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${color}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: NUM_FONT,
                    fontSize: '28px',
                    fontWeight: 800,
                    color: has ? '#0b1120' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: '26px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: SUB_FONT,
          fontSize: '22px',
          fontWeight: 300,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          margin: 0,
        }}
      >
        Generated with LTG
      </p>
    </div>
  );
}
