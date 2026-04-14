interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  completed: 'bg-outline-variant/15 text-outline-variant border-outline-variant/20',
  active: 'bg-sb-warning/15 text-sb-warning border-sb-warning/20',
  failed: 'bg-error/15 text-error border-error/20',
  abandoned: 'bg-outline-variant/10 text-outline-variant border-outline-variant/15',
  running: 'bg-primary/15 text-primary border-primary/20',
  review: 'bg-primary-container/15 text-primary-container border-primary-container/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status?.toLowerCase()] || statusColors.abandoned;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-full capitalize ${colorClass}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
