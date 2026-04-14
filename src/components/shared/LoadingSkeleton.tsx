export function LoadingSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse" aria-label="Loading content" role="status">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-container-high rounded"
          style={{ width: `${80 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
