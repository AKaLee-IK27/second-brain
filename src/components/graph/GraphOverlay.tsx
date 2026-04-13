import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNoteStore } from '../../state/note-store';
import { useUIStore } from '../../state/ui-store';
import { useGraphData } from '../../hooks/useGraphData';
import { PARA_NODE_COLORS } from '../../core/note/graph-builder';
import { runForceSimulation, type ForceNode } from '../../core/note/force-simulation';
import type { ParaCategory } from '../../core/note/note';
import GraphControls from './GraphControls';

function GraphOverlay() {
  const { selectNote } = useNoteStore();
  const { setGraphOverlayOpen } = useUIStore();
  const { nodes: graphNodes, edges } = useGraphData();
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<ParaCategory>>(
    new Set(['projects', 'areas', 'resources', 'archives'])
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [simNodes, setSimNodes] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Filter nodes/edges by PARA category
  const filteredNodes = useMemo(
    () => graphNodes.filter((n) => activeFilters.has(n.paraCategory)),
    [graphNodes, activeFilters]
  );

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [edges, filteredNodes]);

  // 1-hop neighborhood for hover highlighting
  const neighborhood = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const result = new Set<string>([hoveredNodeId]);
    for (const edge of filteredEdges) {
      if (edge.source === hoveredNodeId) result.add(edge.target);
      if (edge.target === hoveredNodeId) result.add(edge.source);
    }
    return result;
  }, [hoveredNodeId, filteredEdges]);

  // Run force simulation when filtered data changes
  useEffect(() => {
    if (filteredNodes.length === 0) {
      setSimNodes(new Map());
      return;
    }

    // Initialize positions (preserve existing if available)
    const forceNodes: ForceNode[] = filteredNodes.map((n) => {
      const existing = simNodes.get(n.id);
      return {
        id: n.id,
        x: existing?.x ?? 300 + (Math.random() - 0.5) * 200,
        y: existing?.y ?? 200 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
      };
    });

    const result = runForceSimulation({
      nodes: forceNodes,
      edges: filteredEdges,
      chargeStrength: -150,
      linkDistance: 80,
      linkStrength: 0.5,
      centerForce: 0.05,
      collisionRadius: 18,
      alphaDecay: 0.03,
      width: 800,
      height: 600,
    });

    const posMap = new Map<string, { x: number; y: number }>();
    for (const node of result) {
      posMap.set(node.id, { x: node.x, y: node.y });
    }
    setSimNodes(posMap);
  }, [filteredNodes, filteredEdges]);

  // Mouse handlers for pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.2, Math.min(3, z * delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && !dragNodeId) {
        setIsPanning(true);
      }
    },
    [dragNodeId]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
      }
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragNodeId(null);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (dragNodeId) return;
      selectNote(nodeId);
      setGraphOverlayOpen(false);
    },
    [selectNote, setGraphOverlayOpen, dragNodeId]
  );

  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDragNodeId(nodeId);
  }, []);

  const handleNodeDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragNodeId) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setSimNodes((prev) => {
        const next = new Map(prev);
        next.set(dragNodeId, { x, y });
        return next;
      });
    },
    [dragNodeId, pan, zoom]
  );

  const handleNodeDragEnd = useCallback(() => {
    setDragNodeId(null);
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGraphOverlayOpen(false);
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(3, z * 1.2));
      if (e.key === '-') setZoom((z) => Math.max(0.2, z / 1.2));
      if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGraphOverlayOpen]);

  const width = 800;
  const height = 600;

  return (
    <div className="fixed inset-0 bg-sb-bg z-50 flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-sb-border bg-sb-surface/80 backdrop-blur-md shrink-0">
        <h2 className="font-display font-semibold text-lg text-sb-text">Graph View</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sb-text-muted">
            {filteredNodes.length} notes &middot; {filteredEdges.length} links
          </span>
          <button
            onClick={() => setGraphOverlayOpen(false)}
            className="sb-btn px-3 py-1 text-sm text-sb-text-secondary"
          >
            &times; Close
          </button>
        </div>
      </div>

      {/* Controls */}
      <GraphControls
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3, z * 1.2))}
        onZoomOut={() => setZoom((z) => Math.max(0.2, z / 1.2))}
        onReset={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
      />

      {/* Graph SVG */}
      <div
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <rect width={width} height={height} fill="transparent" />

          {/* Edges */}
          {filteredEdges.map((edge, i) => {
            const src = simNodes.get(edge.source);
            const tgt = simNodes.get(edge.target);
            if (!src || !tgt) return null;
            const isHighlighted =
              neighborhood.size > 0 &&
              neighborhood.has(edge.source) &&
              neighborhood.has(edge.target);
            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#1A1A1A"
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={neighborhood.size > 0 ? (isHighlighted ? 0.6 : 0.1) : 0.3}
              />
            );
          })}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const pos = simNodes.get(node.id);
            if (!pos) return null;
            const isHovered = hoveredNodeId === node.id;
            const isInNeighborhood = neighborhood.has(node.id);
            const opacity =
              neighborhood.size > 0 ? (isInNeighborhood ? 1 : 0.2) : 1;

            return (
              <g key={node.id} opacity={opacity}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 14 : 10}
                  fill={PARA_NODE_COLORS[node.paraCategory]}
                  stroke="#1A1A1A"
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                  onMouseMove={handleNodeDragMove}
                  onMouseUp={handleNodeDragEnd}
                />
                {isHovered && (
                  <text
                    x={pos.x}
                    y={pos.y - 18}
                    textAnchor="middle"
                    className="font-display font-bold"
                    fontSize="12"
                    fill="#1A1A1A"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.title}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="h-8 flex items-center gap-4 px-4 border-t border-sb-border bg-sb-surface-alt text-xs">
        {(['projects', 'areas', 'resources', 'archives'] as ParaCategory[]).map(
          (cat) => (
            <div key={cat} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full border border-sb-border"
                style={{ backgroundColor: PARA_NODE_COLORS[cat] }}
              />
              <span className="capitalize text-sb-text-secondary">{cat}</span>
            </div>
          )
        )}
        <span className="ml-auto text-sb-text-muted">
          Click node to open &middot; Drag to move &middot; Scroll to zoom
        </span>
      </div>
    </div>
  );
}

export default GraphOverlay;
