import {
  EXPORT_TOTAL_WIDTH,
  EXPORT_TOTAL_HEIGHT,
} from '../utils/exportDimensions';
import FormBadge from './FormBadge';
import TeamStatsGrid from './TeamStatsGrid';
import TeamAvatar from './TeamAvatar';

const TITLE_FONT = 'Bebas Neue, Anton, Oswald, "Arial Narrow", sans-serif';
const SUB_FONT = 'Oswald, "Arial Narrow", sans-serif';
const NUM_FONT = 'Rajdhani, Oswald, sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';

function formatDate() {
  return new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getBanner(position, totalTeams) {
  if (position === 1) {
    return {
      text: 'LEAGUE LEADER',
      bg: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(240,180,0,0.12))',
      border: 'rgba(255,215,0,0.5)',
      color: '#ffe98a',
      glow: '0 0 30px rgba(255,215,0,0.3)',
    };
  }
  if (position && position <= 3) {
    return {
      text: 'TOP 3 TEAM',
      bg: 'linear-gradient(135deg, rgba(205,127,50,0.25), rgba(169,99,34,0.12))',
      border: 'rgba(205,127,50,0.5)',
      color: '#f3c79a',
      glow: '0 0 26px rgba(205,127,50,0.3)',
    };
  }
  if (position && totalTeams && position === totalTeams && totalTeams > 3) {
    return {
      text: 'RELEGATION ZONE',
      bg: 'linear-gradient(135deg, rgba(225,29,72,0.30), rgba(190,18,60,0.15))',
      border: 'rgba(225,29,72,0.55)',
      color: '#ffced8',
      glow: '0 0 26px rgba(225,29,72,0.35)',
    };
  }
  return {
    text: 'MID-TABLE FORM',
    bg: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.14)',
    color: 'rgba(255,255,255,0.78)',
    glow: 'none',
  };
}

/**
 * Flagship Team Profile Card — fixed 1438 × 1451 export graphic.
 * Inline-styled (Tailwind-free) so html2canvas renders it cleanly.
 */
export default function TeamProfileCard({ id, data }) {
  if (!data) return null;

  const banner = getBanner(data.position, data.total_teams);
  const maxPoints = (data.matches || 0) * 3;
  const perf = maxPoints > 0 ? Math.round((data.points / maxPoints) * 100) : 0;

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
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 32%, rgba(255,255,255,0.07) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 65% 50% at 12% 90%, rgba(225,29,72,0.32) 0%, transparent 58%),' +
            'radial-gradient(ellipse 55% 45% at 90% 10%, rgba(244,63,94,0.26) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.02,
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '4px 4px, 7px 7px',
          backgroundPosition: '0 0, 2px 3px',
          pointerEvents: 'none',
        }}
      />

      {/* Centered content column */}
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
            marginBottom: '14px',
          }}
        />

        <h1
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '140px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            margin: 0,
            lineHeight: 0.92,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textShadow: '0 4px 18px rgba(0,0,0,0.6), 0 0 50px rgba(225,29,72,0.30)',
          }}
        >
          Team Profile
        </h1>
        <p
          style={{
            fontFamily: SUB_FONT,
            fontSize: '38px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.8)',
            margin: '2px 0 22px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Updated • {formatDate()}
        </p>

        {/* Identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '34px', marginBottom: '10px' }}>
          <TeamAvatar
            logo={data.logo}
            name={data.team_name}
            size={180}
            fontFamily={TITLE_FONT}
            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.15)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
            <span
              style={{
                fontFamily: SUB_FONT,
                fontSize: '26px',
                fontWeight: 500,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                marginBottom: '4px',
              }}
            >
              {data.tournament_name}
            </span>
            <span
              style={{
                fontFamily: TITLE_FONT,
                fontSize: '92px',
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#ffffff',
                textShadow: '0 3px 14px rgba(0,0,0,0.55)',
              }}
            >
              {data.team_name}
            </span>
          </div>
          {data.position && (
            <span
              style={{
                marginLeft: '8px',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '150px',
                height: '150px',
                borderRadius: '28px',
                background:
                  data.position === 1
                    ? 'linear-gradient(135deg,#ffd700,#f0b400)'
                    : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: data.position === 1 ? '0 0 30px rgba(255,215,0,0.3)' : 'none',
                color: data.position === 1 ? '#1a1a1a' : '#fff',
              }}
            >
              <span style={{ fontFamily: SUB_FONT, fontSize: '22px', fontWeight: 600, letterSpacing: '2px', opacity: 0.8 }}>
                RANK
              </span>
              <span style={{ fontFamily: NUM_FONT, fontSize: '84px', fontWeight: 800, lineHeight: 1 }}>
                #{data.position}
              </span>
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ width: '100%', marginTop: '20px' }}>
          <TeamStatsGrid stats={data} columns={4} cardHeight={150} numberSize={66} labelSize={26} gap={18} />
        </div>

        {/* Recent form */}
        <div style={{ width: '100%', marginTop: '26px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: SUB_FONT,
              fontSize: '30px',
              fontWeight: 600,
              letterSpacing: '5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '14px',
            }}
          >
            Recent Form
          </div>
          <FormBadge form={data.form} size={64} fontSize={34} gap={16} />
        </div>

        {/* Performance bar */}
        <div style={{ width: '100%', marginTop: '26px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                fontFamily: SUB_FONT,
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Season Performance
            </span>
            <span style={{ fontFamily: NUM_FONT, fontSize: '34px', fontWeight: 800, color: '#fb7185' }}>
              {perf}%
            </span>
          </div>
          <div style={{ width: '100%', height: '20px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${perf}%`,
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #E11D48 0%, #FB7185 100%)',
                boxShadow: '0 0 16px rgba(225,29,72,0.5)',
              }}
            />
          </div>
        </div>

        {/* Status banner */}
        <div
          style={{
            marginTop: '26px',
            padding: '16px 44px',
            borderRadius: '999px',
            background: banner.bg,
            border: `1px solid ${banner.border}`,
            boxShadow: banner.glow,
            fontFamily: TITLE_FONT,
            fontSize: '46px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: banner.color,
          }}
        >
          {banner.text}
        </div>
      </div>

      {/* Footer watermark */}
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
