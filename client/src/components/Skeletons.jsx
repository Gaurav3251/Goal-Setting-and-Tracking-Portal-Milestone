export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-x-auto rounded border bg-white p-3">
      <div className="min-w-full space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))` }}>
            {Array.from({ length: cols }).map((__, c) => (
              <SkeletonBlock key={c} className="h-6" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-xl border bg-white p-4">
          <SkeletonBlock className="h-5 w-2/3" />
          <SkeletonBlock className="mt-3 h-4 w-1/2" />
          <SkeletonBlock className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
