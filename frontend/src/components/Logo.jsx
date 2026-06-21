import { Link } from 'react-router-dom';
import { FaFutbol } from 'react-icons/fa';

/**
 * LTG platform wordmark. Red gradient badge + condensed wordmark.
 */
export default function Logo({ to = '/', size = 'md', className = '' }) {
  const dims = {
    sm: { badge: 'h-8 w-8', icon: 14, text: 'text-lg' },
    md: { badge: 'h-9 w-9', icon: 16, text: 'text-xl' },
    lg: { badge: 'h-11 w-11', icon: 20, text: 'text-2xl' },
    xl: { badge: 'h-[52px] w-[52px]', icon: 26, text: 'text-3xl' },
  }[size];

  const content = (
    <>
      <span
        className={`brand-badge d-inline-flex align-items-center justify-content-center ${dims.badge} rounded-2xl text-white`}
      >
        <FaFutbol size={dims.icon} />
      </span>
      <span
        className={`font-display fw-bold ${dims.text}`}
        style={{ letterSpacing: '2px', lineHeight: 1 }}
      >
        LTG
      </span>
    </>
  );

  if (!to) {
    return <span className={`d-inline-flex align-items-center gap-2 text-white ${className}`}>{content}</span>;
  }

  return (
    <Link
      to={to}
      className={`logo-link d-inline-flex align-items-center gap-2 text-white text-decoration-none ${className}`}
    >
      {content}
    </Link>
  );
}
