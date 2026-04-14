import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import type { GraphNode, GraphEdge } from '../../types/graph';

interface UnifiedGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  mode?: 'mini' | 'full';
  onNodeClick?: (node: GraphNode) => void;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: GraphNode['type'];
  color: string;
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  type: GraphEdge['type'];
}

export function UnifiedGraph({
  nodes,
  edges,
  width = 240,
  height = 160,
  mode = 'mini',
  onNodeClick,
}: UnifiedGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const [selectedTypes] = useState<Set<GraphNode['type']>>(
    new Set(['session', 'topic', 'agent', 'skill'])
  );
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; type: string } | null>(null);

  const handleDefaultNodeClick = useCallback((node: GraphNode) => {
    const slug = (node.metadata as Record<string, unknown>).slug as string | undefined;
    switch (node.type) {
      case 'session':
        navigate(`/sessions/${node.id.replace('session:', '')}`);
        break;
      case 'topic':
        if (slug) navigate(`/topics/${slug}`);
        break;
      case 'agent':
        if (slug) navigate(`/agents/${slug}`);
        break;
      case 'skill':
        if (slug) navigate(`/skills/${slug}`);
        break;
    }
  }, [navigate]);

  const nodeClick = onNodeClick || handleDefaultNodeClick;

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Filter nodes and edges by selected types
    const filteredNodes = nodes.filter((n) => selectedTypes.has(n.type));
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    if (filteredNodes.length === 0) return;

    // Convert to simulation types
    const simNodes: SimNode[] = filteredNodes.map((n) => ({
      ...n,
      x: undefined,
      y: undefined,
    }));

    const simLinks: SimLink[] = filteredEdges.map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type,
    }));

    // Create simulation
    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Draw edges
    const link = svg
      .append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', '#4a5568')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1);

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('circle')
      .data(simNodes)
      .join('circle')
      .attr('r', mode === 'mini' ? 4 : 6)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#1a202c')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        nodeClick({
          id: d.id,
          label: d.label,
          type: d.type,
          color: d.color,
          metadata: d.metadata,
        });
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        setTooltip({
          x: event.offsetX,
          y: event.offsetY - 10,
          label: d.label,
          type: d.type,
        });
      })
      .on('mouseout', () => {
        setHoveredNode(null);
        setTooltip(null);
      })
      .call(
        d3
          .drag<SVGCircleElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0);

      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);
    });

    // Highlight 1-hop neighborhood on hover
    if (mode === 'full' && hoveredNode) {
      const connectedIds = new Set<string>();
      connectedIds.add(hoveredNode.id);
      simLinks.forEach((l) => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
        const targetId = typeof l.target === 'string' ? l.target : l.target.id;
        if (sourceId === hoveredNode.id) connectedIds.add(targetId);
        if (targetId === hoveredNode.id) connectedIds.add(sourceId);
      });

      node.attr('opacity', (d) => (connectedIds.has(d.id) ? 1 : 0.2));
      link.attr('stroke-opacity', (d) => {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        return connectedIds.has(sourceId) && connectedIds.has(targetId) ? 0.8 : 0.1;
      });
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height, mode, selectedTypes, hoveredNode, nodeClick]);

  // Empty state
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-xs text-sb-text-muted text-center px-4">
          {mode === 'mini'
            ? 'No knowledge graph yet'
            : 'No knowledge graph yet. Knowledge will appear after you create sessions with opencode.'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-sb-surface rounded"
      />
      {tooltip && mode === 'full' && (
        <div
          className="absolute z-10 px-2 py-1 text-xs bg-sb-surface border border-sb-border rounded shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 20 }}
        >
          <div className="font-medium text-sb-text">{tooltip.label}</div>
          <div className="text-sb-text-muted capitalize">{tooltip.type}</div>
        </div>
      )}
    </div>
  );
}
