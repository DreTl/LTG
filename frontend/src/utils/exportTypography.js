import { EXPORT_CONTENT_HEIGHT } from './exportDimensions';

export function formatExportDate() {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Adaptive title maximum based on character count. */
function getTitleMax(text) {
  const len = (text || '').length;
  if (len <= 20) return 200;
  if (len <= 30) return 170;
  if (len <= 40) return 150;
  return 120;
}

export function buildExportTitle(tournamentName, season) {
  const base = (tournamentName || 'Soccer League').trim();
  const seasonStr = (season || '').trim();
  if (seasonStr && !base.toLowerCase().includes(seasonStr.toLowerCase())) {
    return `${base} ${seasonStr}`.toUpperCase();
  }
  return base.toUpperCase();
}

/**
 * Elite social-graphic typography. Targets the requested maxima then scales
 * down to fit the 1123×1108 content block, protecting the title last.
 *
 * Reduction priority (most-important rule): legend → row spacing →
 * statistics → team names → date → title.
 */
export function computeExportTypography(teamCount, titleText) {
  const titleMax = getTitleMax(titleText);
  const titleMin = Math.max(70, Math.round(titleMax * 0.5));
  const rowMin = teamCount > 16 ? 34 : 42;

  const s = {
    title: titleMax,
    date: 75,
    header: 55,
    team: 60,
    stats: 52,
    pts: 58,
    legend: 45,
    rowHeight: teamCount <= 12 ? 80 : teamCount <= 16 ? 60 : 48,
    rowGap: 10,
    headerRowHeight: 90,
  };

  const titleBlock = () => s.title * 1.04 + s.date + 56;
  const legendBlock = () => s.legend * 2.4 + 24;
  const headerBlock = () => s.headerRowHeight + 18;

  const totalHeight = () =>
    titleBlock() +
    headerBlock() +
    teamCount * (s.rowHeight + s.rowGap) +
    legendBlock() +
    40;

  const dec = (key, step, min) => {
    if (s[key] > min) {
      s[key] = Math.max(min, s[key] - step);
      return true;
    }
    return false;
  };

  // Ordered by reduction priority; title shrinks slowest and last.
  const steps = [
    () => dec('legend', 2, 20),
    () => {
      const a = dec('rowGap', 1, 2);
      const b = dec('rowHeight', 2, rowMin);
      const c = dec('headerRowHeight', 2, 56);
      return a || b || c;
    },
    () => {
      const a = dec('stats', 2, 24);
      const b = dec('header', 2, 30);
      const c = dec('pts', 2, 30);
      return a || b || c;
    },
    () => dec('team', 2, 30),
    () => dec('date', 2, 30),
    () => dec('title', 4, titleMin),
  ];

  let guard = 0;
  while (totalHeight() > EXPORT_CONTENT_HEIGHT && guard < 1200) {
    steps[guard % steps.length]();
    guard += 1;
  }

  return {
    titleSize: s.title,
    dateSize: s.date,
    headerSize: s.header,
    teamSize: s.team,
    statsSize: s.stats,
    ptsSize: s.pts,
    legendSize: s.legend,
    rowHeight: s.rowHeight,
    rowGap: s.rowGap,
    headerRowHeight: s.headerRowHeight,
  };
}

export function getPositionRowStyle(position, totalTeams, highlightPositions) {
  if (!highlightPositions) {
    return { background: 'transparent', color: '#ffffff' };
  }
  if (position === 1) return { background: 'rgba(255, 215, 0, 0.35)', color: '#ffffff' };
  if (position === 2) return { background: 'rgba(192, 192, 192, 0.25)', color: '#ffffff' };
  if (position === 3) return { background: 'rgba(205, 127, 50, 0.3)', color: '#ffffff' };
  if (position === totalTeams && totalTeams > 3) return { background: 'rgba(229, 57, 53, 0.35)', color: '#ffffff' };
  return { background: 'transparent', color: '#ffffff' };
}
