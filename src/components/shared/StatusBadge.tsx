interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  completed: 'bg-sb-success/20 text-sb-success border-sb-success/30',
  active: 'bg-sb-accent/20 text-sb-accent border-sb-accent/30',
  failed: 'bg-sb-error/20 text-sb-error border-sb-error/30',
  abandoned: 'bg-sb-text-muted/20 text-sb-text-muted border-sb-text-muted/30',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || statusColors.abandoned;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full capitalize ${colorClass}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
