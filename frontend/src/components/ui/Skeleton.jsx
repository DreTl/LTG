export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/** Grid of stat-widget shaped skeletons. */
export function StatSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} style={{ height: 160, borderRadius: 24 }} />
      ))}
    </div>
  );
}

/** Placeholder rows for a table while loading. */
export function TableSkeleton({ rows = 8, cols = 9 }) {
  return (
    <div className="ltg-table-wrap p-4">
      <Skeleton style={{ height: 40, marginBottom: 16 }} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-3">
            <Skeleton style={{ height: 44, width: 44, borderRadius: 9999 }} />
            <Skeleton style={{ height: 20, flex: 1 }} />
            {Array.from({ length: cols - 2 }).map((_, c) => (
              <Skeleton key={c} style={{ height: 20, width: 28 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Generic card skeleton grid. */
export function CardSkeletonGrid({ count = 6, height = 180 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} style={{ height, borderRadius: 24 }} />
      ))}
    </div>
  );
}
