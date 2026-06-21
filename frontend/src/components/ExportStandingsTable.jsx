import {
  EXPORT_TOTAL_WIDTH,
  EXPORT_TOTAL_HEIGHT,
  EXPORT_CONTENT_WIDTH,
  EXPORT_CONTENT_HEIGHT,
} from '../utils/exportDimensions';
import {
  computeExportTypography,
  buildExportTitle,
  formatExportDate,
} from '../utils/exportTypography';
import TeamAvatar from './TeamAvatar';

const FONT_STACK = 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const TITLE_FONT = 'Oswald, "Bebas Neue", Anton, "Arial Narrow", sans-serif';
const HEADER_FONT = 'Oswald, "Arial Narrow", Arial, sans-serif';
const NUM_FONT = 'Rajdhani, Oswald, "Segoe UI", sans-serif';
const BG_IMAGE = '/export-stadium-bg.png';

const COLUMNS = [
  { key: 'no', label: 'NO', align: 'left', width: '7%' },
  { key: 'team', label: 'TEAM', align: 'left', width: '30%' },
  { key: 'p', label: 'P', align: 'center', width: '7%' },
  { key: 'w', label: 'W', align: 'center', width: '7%' },
  { key: 'd', label: 'D', align: 'center', width: '7%' },
  { key: 'l', label: 'L', align: 'center', width: '7%' },
  { key: 'f', label: 'F', align: 'center', width: '7%' },
  { key: 'a', label: 'A', align: 'center', width: '7%' },
  { key: 'gd', label: '+/-', align: 'center', width: '7%' },
  { key: 'pts', label: 'PTS', align: 'center', width: '10%' },
];

const MEDAL_LEGEND = [
  { color: 'linear-gradient(135deg,#ffd700,#f0b400)', label: '1  Gold' },
  { color: 'linear-gradient(135deg,#d8d8d8,#a8a8a8)', label: '2  Silver' },
  { color: 'linear-gradient(135deg,#cd7f32,#a96322)', label: '3  Bronze' },
  { color: 'rgba(225,29,72,0.85)', label: 'Last  Relegation' },
];

function getRank(position, totalTeams, highlight) {
  if (!highlight) return 'default';
  if (position === 1) return 'gold';
  if (position === 2) return 'silver';
  if (position === 3) return 'bronze';
  if (position === totalTeams && totalTeams > 3) return 'last';
  return 'default';
}

const RANK_STYLE = {
  gold: { bg: 'linear-gradient(135deg,#ffd700,#f0b400)', color: '#1a1a1a', glow: '0 0 20px rgba(255,215,0,0.35)' },
  silver: { bg: 'linear-gradient(135deg,#d8d8d8,#a8a8a8)', color: '#1a1a1a', glow: '0 0 20px rgba(192,192,192,0.30)' },
  bronze: { bg: 'linear-gradient(135deg,#cd7f32,#a96322)', color: '#ffffff', glow: '0 0 20px rgba(205,127,50,0.35)' },
  last: { bg: 'rgba(225,29,72,0.30)', color: '#ffd7de', glow: '0 0 18px rgba(225,29,72,0.40)' },
  default: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', glow: 'none' },
};

const ROW_TINT = {
  gold: 'rgba(255,215,0,0.10)',
  silver: 'rgba(192,192,192,0.08)',
  bronze: 'rgba(205,127,50,0.10)',
  last: 'rgba(225,29,72,0.12)',
  default: 'rgba(255,255,255,0.03)',
};

export default function ExportStandingsTable({
  standings,
  tournamentName,
  season,
  id,
  highlightPositions = true,
}) {
  const totalTeams = standings.length;
  const titleText = buildExportTitle(tournamentName, season);
  const generatedDate = formatExportDate();
  const typo = computeExportTypography(totalTeams, titleText);

  const headerColor = 'rgba(255,255,255,0.92)';
  const logoSize = Math.min(60, Math.round(typo.teamSize));
  const badgeSize = Math.min(64, Math.round(typo.statsSize * 1.25));
  const legendSwatch = Math.round(typo.legendSize * 0.7);

  return (
    <div
      id={id}
      style={{
        width: `${EXPORT_TOTAL_WIDTH}px`,
        height: `${EXPORT_TOTAL_HEIGHT}px`,
        minWidth: `${EXPORT_TOTAL_WIDTH}px`,
        minHeight: `${EXPORT_TOTAL_HEIGHT}px`,
        maxWidth: `${EXPORT_TOTAL_WIDTH}px`,
        maxHeight: `${EXPORT_TOTAL_HEIGHT}px`,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_STACK,
        backgroundColor: '#0b1120',
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* Dark overlay for depth */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />

      {/* Radial spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.06) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Red smoke accents */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 65% 50% at 12% 88%, rgba(225,29,72,0.30) 0%, transparent 58%),' +
            'radial-gradient(ellipse 55% 45% at 90% 12%, rgba(244,63,94,0.24) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle noise texture (~2%) */}
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

      {/* Content block — 1123 × 1108 centered */}
      <div
        style={{
          position: 'absolute',
          left: `${(EXPORT_TOTAL_WIDTH - EXPORT_CONTENT_WIDTH) / 2}px`,
          top: `${(EXPORT_TOTAL_HEIGHT - EXPORT_CONTENT_HEIGHT) / 2}px`,
          width: `${EXPORT_CONTENT_WIDTH}px`,
          height: `${EXPORT_CONTENT_HEIGHT}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 24px 14px',
        }}
      >
        {/* Top accent gradient bar — ESPN / Sofascore signature */}
        <div
          style={{
            height: '8px',
            width: '100%',
            borderRadius: '20px',
            background: 'linear-gradient(90deg, #E11D48 0%, #FB7185 50%, #E11D48 100%)',
            boxShadow: '0 0 18px rgba(225,29,72,0.45)',
            marginBottom: '18px',
            flexShrink: 0,
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontFamily: TITLE_FONT,
            fontSize: `${typo.titleSize}px`,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            margin: '0 0 4px',
            lineHeight: 0.98,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            textShadow: '0 3px 16px rgba(0,0,0,0.6), 0 0 40px rgba(225,29,72,0.30)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 0,
          }}
        >
          {titleText}
        </h1>

        {/* Date */}
        <p
          style={{
            fontFamily: TITLE_FONT,
            fontSize: `${typo.dateSize}px`,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.8)',
            opacity: 0.85,
            textAlign: 'center',
            margin: '0 0 18px',
            letterSpacing: '2px',
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            flexShrink: 0,
          }}
        >
          Updated • {generatedDate}
        </p>

        {/* Standings panel */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: `0 ${typo.rowGap}px`,
              tableLayout: 'fixed',
              flexShrink: 0,
            }}
          >
            <thead>
              <tr style={{ height: `${typo.headerRowHeight}px` }}>
                {COLUMNS.map((col, i) => (
                  <th
                    key={col.key}
                    style={{
                      fontFamily: HEADER_FONT,
                      fontSize: `${typo.headerSize}px`,
                      fontWeight: 700,
                      color: headerColor,
                      textTransform: 'uppercase',
                      height: `${typo.headerRowHeight}px`,
                      verticalAlign: 'middle',
                      textAlign: col.align,
                      letterSpacing: '2px',
                      padding: col.key === 'team' ? '0 18px' : '0 4px',
                      width: col.width,
                      background: 'rgba(255,255,255,0.04)',
                      borderTopLeftRadius: i === 0 ? '20px' : 0,
                      borderBottomLeftRadius: i === 0 ? '20px' : 0,
                      borderTopRightRadius: i === COLUMNS.length - 1 ? '20px' : 0,
                      borderBottomRightRadius: i === COLUMNS.length - 1 ? '20px' : 0,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => {
                const rank = getRank(team.position, totalTeams, highlightPositions);
                const rankStyle = RANK_STYLE[rank];
                const values = {
                  p: team.played,
                  w: team.wins,
                  d: team.draws,
                  l: team.losses,
                  f: team.goals_for,
                  a: team.goals_against,
                  gd: team.goal_difference,
                  pts: team.points,
                };

                return (
                  <tr key={team.team_id} style={{ height: `${typo.rowHeight}px` }}>
                    {COLUMNS.map((col, i) => {
                      const isFirst = i === 0;
                      const isLast = i === COLUMNS.length - 1;
                      const cardStyle = {
                        background: ROW_TINT[rank],
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: isFirst ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        borderRight: isLast ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        borderTopLeftRadius: isFirst ? '14px' : 0,
                        borderBottomLeftRadius: isFirst ? '14px' : 0,
                        borderTopRightRadius: isLast ? '14px' : 0,
                        borderBottomRightRadius: isLast ? '14px' : 0,
                        height: `${typo.rowHeight}px`,
                        verticalAlign: 'middle',
                      };

                      if (col.key === 'no') {
                        return (
                          <td key={col.key} style={{ ...cardStyle, padding: '0 4px 0 12px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: `${badgeSize}px`,
                                height: `${badgeSize}px`,
                                borderRadius: '12px',
                                fontFamily: NUM_FONT,
                                fontSize: `${Math.round(typo.statsSize * 0.95)}px`,
                                fontWeight: 700,
                                background: rankStyle.bg,
                                color: rankStyle.color,
                                boxShadow: rankStyle.glow,
                              }}
                            >
                              {team.position}
                            </span>
                          </td>
                        );
                      }

                      if (col.key === 'team') {
                        return (
                          <td key={col.key} style={{ ...cardStyle, padding: '0 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                              <TeamAvatar
                                logo={team.logo}
                                name={team.team}
                                size={logoSize}
                                fontFamily={NUM_FONT}
                                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.12)' }}
                              />
                              <span
                                style={{
                                  fontSize: `${typo.teamSize}px`,
                                  fontWeight: 700,
                                  letterSpacing: '1px',
                                  color: '#ffffff',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {team.team}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      const isPts = col.key === 'pts';
                      return (
                        <td
                          key={col.key}
                          style={{
                            ...cardStyle,
                            textAlign: 'center',
                            padding: '0 4px',
                            fontFamily: NUM_FONT,
                            fontSize: isPts ? `${typo.ptsSize}px` : `${typo.statsSize}px`,
                            fontWeight: isPts ? 800 : 600,
                            color: isPts ? '#ffffff' : 'rgba(255,255,255,0.82)',
                          }}
                        >
                          {values[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Premium medal legend — centered */}
          <div style={{ marginTop: 'auto', paddingTop: '14px', textAlign: 'center', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: HEADER_FONT,
                fontSize: `${Math.round(typo.legendSize * 0.8)}px`,
                fontWeight: 700,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '10px',
              }}
            >
              Legend
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '14px 28px',
                opacity: 0.8,
              }}
            >
              {MEDAL_LEGEND.map((item) => (
                <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: `${legendSwatch}px`,
                      height: `${legendSwatch}px`,
                      borderRadius: '6px',
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: NUM_FONT,
                      fontSize: `${typo.legendSize}px`,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
