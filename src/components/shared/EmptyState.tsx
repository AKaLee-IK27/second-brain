import { MaterialIcon } from './MaterialIcon';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MaterialIcon name="inbox" size={48} className="text-outline-variant mb-4" />
      <h3 className="font-headline text-lg font-medium text-on-surface mb-2">{title}</h3>
      <p className="font-serif text-on-surface-variant mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="sb-btn-primary px-6 py-2.5 rounded-lg font-headline font-bold"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
