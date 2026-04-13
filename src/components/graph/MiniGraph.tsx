import { useMemo } from 'react';
import { useUIStore } from '../../state/ui-store';
import { useGraphData } from '../../hooks/useGraphData';
import { PARA_NODE_COLORS } from '../../core/note/graph-builder';

function MiniGraph() {
  const { setGraphOverlayOpen } = useUIStore();
  const { nodes, edges } = useGraphData();

  const displayNodes = useMemo(() => nodes.slice(0, 30), [nodes]);
  const displayEdges = useMemo(() => {
    const nodeIds = new Set(displayNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [edges, displayNodes]);

  const width = 240;
  const height = 160;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  const positions = useMemo(() => {
    return displayNodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / displayNodes.length - Math.PI / 2;
      return {
        id: node.id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        color: PARA_NODE_COLORS[node.paraCategory],
      };
    });
  }, [displayNodes]);

  const posMap = new Map(positions.map((p) => [p.id, p]));

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sb-text-muted text-sm font-display">No notes to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className="sb-card p-2 cursor-pointer hover:bg-sb-yellow-tint transition-colors"
        onClick={() => setGraphOverlayOpen(true)}
      >
        <svg width={width} height={height} className="w-full">
          {displayEdges.map((edge, i) => {
            const src = posMap.get(edge.source);
            const tgt = posMap.get(edge.target);
            if (!src || !tgt) return null;
            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#1A1A1A"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}
          {positions.map((pos) => (
            <circle
              key={pos.id}
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill={pos.color}
              stroke="#1A1A1A"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
      <div className="flex items-center justify-between text-xs text-sb-text-muted">
        <span>
          {nodes.length} notes &middot; {edges.length} links
        </span>
        <button
          onClick={() => setGraphOverlayOpen(true)}
          className="sb-btn px-2 py-0.5 text-xs"
        >
          Expand &nearr;
        </button>
      </div>
    </div>
  );
}

export default MiniGraph;
