interface KnowledgeBadgeProps {
  count: number;
}

export function KnowledgeBadge({ count }: KnowledgeBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-primary/15 text-primary border border-primary/20 rounded-full">
      <span className="font-medium">{count}</span>
      <span className="text-outline-variant">finding{count !== 1 ? 's' : ''}</span>
    </span>
  );
}
