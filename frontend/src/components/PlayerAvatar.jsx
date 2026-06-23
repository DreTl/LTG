import { useState } from 'react';
import { getTeamGradient } from '../utils/teamInitials';

function getPlayerInitials(name) {
  if (!name) return '?';
  const words = name.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[words.length - 1][0]).slice(0, 2);
}

/**
 * Circular player avatar that renders the player photo when available and
 * falls back to initials on a deterministic gradient. Inline-styled so it
 * renders identically in the live UI and inside html2canvas export graphics.
 */
export default function PlayerAvatar({
  name,
  photo,
  size = 56,
  shape = 'circle',
  fontFamily,
  className = '',
  style = {},
  crossOrigin = 'anonymous',
}) {
  const [errored, setErrored] = useState(null);
  const broken = !!photo && errored === photo;

  const dimension = typeof size === 'number' ? `${size}px` : size;
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 56;
  const borderRadius = shape === 'rounded' ? `${Math.round(numericSize * 0.18)}px` : '50%';

  const baseStyle = {
    width: dimension,
    height: dimension,
    borderRadius,
    flexShrink: 0,
    ...style,
  };

  if (photo && !broken) {
    return (
      <img
        src={photo}
        alt={name || 'Player'}
        crossOrigin={crossOrigin}
        className={className}
        onError={() => setErrored(photo)}
        style={{ ...baseStyle, objectFit: 'cover', background: 'rgba(255,255,255,0.06)' }}
      />
    );
  }

  const fontSize = Math.round(numericSize * 0.4);

  return (
    <span
      className={className}
      role="img"
      aria-label={name || 'Player'}
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
      {getPlayerInitials(name)}
    </span>
  );
}
