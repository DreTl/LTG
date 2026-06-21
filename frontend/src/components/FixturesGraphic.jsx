import TeamAvatar from './TeamAvatar';

const TITLE_FONT = 'Oswald, "Bebas Neue", Anton, "Arial Narrow", sans-serif';
const BODY_FONT = 'Rajdhani, Oswald, "Segoe UI", sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';
const WIDTH = 1080;

function MatchRow({ home, away, time }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '14px 22px',
        marginBottom: '12px',
      }}
    >
      <span
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '14px',
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: '30px',
            fontWeight: 700,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {home}
        </span>
        <TeamAvatar name={home} size={48} fontFamily={BODY_FONT} />
      </span>
      <span
        style={{
          flexShrink: 0,
          width: '110px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '20px',
            fontWeight: 700,
            color: '#fb7185',
            letterSpacing: '1px',
          }}
        >
          VS
        </span>
        {time && (
          <span
            style={{
              fontFamily: BODY_FONT,
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              marginTop: '2px',
            }}
          >
            {time}
          </span>
        )}
      </span>
      <span
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '14px',
          minWidth: 0,
        }}
      >
        <TeamAvatar name={away} size={48} fontFamily={BODY_FONT} />
        <span
          style={{
            fontFamily: BODY_FONT,
            fontSize: '30px',
            fontWeight: 700,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {away}
        </span>
      </span>
    </div>
  );
}

/**
 * Inline-styled (Tailwind-free) professional fixtures graphic for image export.
 * `rounds` is the array returned by the fixtures API.
 */
export default function FixturesGraphic({ id, title, subtitle, rounds }) {
  return (
    <div
      id={id}
      style={{
        width: `${WIDTH}px`,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0b1120',
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        fontFamily: BODY_FONT,
        paddingBottom: '8px',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', pointerEvents: 'none' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 65% 50% at 12% 92%, rgba(225,29,72,0.28) 0%, transparent 58%),' +
            'radial-gradient(ellipse 55% 45% at 90% 8%, rgba(244,63,94,0.22) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', padding: '48px 56px 40px' }}>
        <div
          style={{
            height: '8px',
            width: '100%',
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #E11D48 0%, #FB7185 50%, #E11D48 100%)',
            boxShadow: '0 0 18px rgba(225,29,72,0.45)',
            marginBottom: '26px',
          }}
        />

        <h1
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '64px',
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            margin: '0 0 6px',
            lineHeight: 1,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            textShadow: '0 3px 16px rgba(0,0,0,0.6), 0 0 40px rgba(225,29,72,0.30)',
          }}
        >
          {title || 'Fixtures'}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: TITLE_FONT,
              fontSize: '24px',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              margin: '0 0 32px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </p>
        )}

        {rounds.map((round) => (
          <div key={round.round} style={{ marginBottom: '30px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: '30px',
                  fontWeight: 700,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  whiteSpace: 'nowrap',
                }}
              >
                Round {round.round}
              </span>
              <span style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.12)' }} />
            </div>
            {round.matches.map((m, i) => (
              <MatchRow key={i} home={m.home} away={m.away} time={m.time} />
            ))}
          </div>
        ))}

        <p
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '18px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            margin: '20px 0 0',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          Generated with LTG
        </p>
      </div>
    </div>
  );
}
