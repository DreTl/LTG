import { useState } from 'react';
import { getTeamInitials, getTeamGradient } from '../utils/teamInitials';

/**
 * Centralized team avatar used everywhere a short team representation is needed
 * (profile cards, standings, team of the week, fixtures, tickets, posters,
 * match graphics, mobile tables, dashboards, statistics pages, etc.).
 *
 * Renders the team logo when available. When a logo is missing or fails to
 * load, it automatically falls back to a circular avatar containing the
 * three-letter initials on a deterministic gradient background.
 *
 * Inline styles are used for sizing/shape so the same component renders
 * cleanly both in the live UI and inside html2canvas export graphics.
 *
 * Props:
 *  - name:       team name (used for initials + gradient + alt text)
 *  - logo:       optional logo URL
 *  - size:       pixel size of the avatar (number, default 44)
 *  - shape:      'circle' (default) or 'rounded'
 *  - fontFamily: optional font for the initials (defaults to inherited font)
 *  - className / style: forwarded for extra styling
 *  - crossOrigin: img crossOrigin, defaults to 'anonymous' for export safety
 */
export default function TeamAvatar({
  name,
  logo,
  size = 44,
  shape = 'circle',
  fontFamily,
  className = '',
  style = {},
  crossOrigin = 'anonymous',
}) {
  // Track which logo URL failed so a logo change automatically retries.
  const [erroredLogo, setErroredLogo] = useState(null);
  const broken = !!logo && erroredLogo === logo;

  const dimension = typeof size === 'number' ? `${size}px` : size;
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 44;
  const borderRadius = shape === 'rounded' ? `${Math.round(numericSize * 0.22)}px` : '50%';

  const baseStyle = {
    width: dimension,
    height: dimension,
    borderRadius,
    flexShrink: 0,
    ...style,
  };

  if (logo && !broken) {
    return (
      <img
        src={logo}
        alt={name || 'Team'}
        crossOrigin={crossOrigin}
        className={className}
        onError={() => setErroredLogo(logo)}
        style={{
          ...baseStyle,
          objectFit: 'cover',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
    );
  }

  const initials = getTeamInitials(name);
  const fontSize = Math.round(numericSize * (initials.length > 2 ? 0.34 : 0.46));

  return (
    <span
      className={className}
      role="img"
      aria-label={name || 'Team'}
      style={{
        ...baseStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: getTeamGradient(name),
        color: '#ffffff',
        fontFamily,
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        userSelect: 'none',
        boxShadow: '0 0 20px rgba(0,0,0,0.18)',
      }}
    >
      {initials}
    </span>
  );
}
