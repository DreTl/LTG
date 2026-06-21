import { Link } from 'react-router-dom';
import { ScaleIn } from './Motion';

/**
 * Premium empty state with emoji, title, subtitle and optional CTA.
 */
export default function EmptyState({
  emoji = '⚽',
  title,
  subtitle,
  actionLabel,
  onAction,
  actionTo,
}) {
  const action = actionLabel ? (
    actionTo ? (
      <Link to={actionTo} className="btn-ltg btn-ltg-primary">
        {actionLabel}
      </Link>
    ) : (
      <button type="button" onClick={onAction} className="btn-ltg btn-ltg-primary">
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <ScaleIn className="empty-state">
      <div className="empty-emoji">{emoji}</div>
      <h3 className="empty-title">{title}</h3>
      {subtitle && <p className="empty-sub">{subtitle}</p>}
      {action}
    </ScaleIn>
  );
}
