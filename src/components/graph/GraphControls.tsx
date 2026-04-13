import type { ParaCategory } from '../../core/note/note';
import { PARA_NODE_COLORS } from '../../core/note/graph-builder';

interface GraphControlsProps {
  activeFilters: Set<ParaCategory>;
  onFilterChange: (filters: Set<ParaCategory>) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

function GraphControls({
  activeFilters,
  onFilterChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: GraphControlsProps) {
  const categories: ParaCategory[] = ['projects', 'areas', 'resources', 'archives'];

  const toggleFilter = (cat: ParaCategory) => {
    const next = new Set(activeFilters);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    onFilterChange(next);
  };

  return (
    <div className="h-10 flex items-center justify-between px-4 border-b border-sb-border bg-sb-surface shrink-0">
      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleFilter(cat)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-display font-medium border border-sb-border rounded-sm transition-all ${
              activeFilters.has(cat) ? 'shadow-sm' : 'opacity-50'
            }`}
            style={{ backgroundColor: activeFilters.has(cat) ? PARA_NODE_COLORS[cat] : 'transparent' }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} className="sb-btn px-2 py-0.5 text-xs text-sb-text-secondary">
          &minus;
        </button>
        <span className="text-xs font-mono w-12 text-center text-sb-text">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="sb-btn px-2 py-0.5 text-xs text-sb-text-secondary">
          &plus;
        </button>
        <button onClick={onReset} className="sb-btn px-2 py-0.5 text-xs ml-2 text-sb-text-secondary">
          Reset
        </button>
      </div>
    </div>
  );
}

export default GraphControls;
