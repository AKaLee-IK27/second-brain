interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-lg font-medium text-sb-text mb-2">{title}</h3>
      <p className="text-sb-text-secondary mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="sb-btn sb-btn-accent px-4 py-2"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
