const ENTITY_TYPES = [
  { type: 'session' as const, label: 'Sessions', color: '#6366f1' },
  { type: 'topic' as const, label: 'Topics', color: '#22c55e' },
  { type: 'agent' as const, label: 'Agents', color: '#a855f7' },
  { type: 'skill' as const, label: 'Skills', color: '#f97316' },
];

interface GraphLegendProps {
  activeTypes?: Set<string>;
  onToggle?: (type: string) => void;
}

export function GraphLegend({ activeTypes, onToggle }: GraphLegendProps) {
  return (
    <div className="flex items-center gap-3 text-xs">
      {ENTITY_TYPES.map(({ type, label, color }) => {
        const isActive = activeTypes ? activeTypes.has(type) : true;
        return (
          <button
            key={type}
            onClick={() => onToggle?.(type)}
            className={`flex items-center gap-1.5 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-40'
            }`}
            title={`Toggle ${label}`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full border border-sb-border"
              style={{ backgroundColor: color }}
            />
            <span className="text-sb-text-secondary">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
