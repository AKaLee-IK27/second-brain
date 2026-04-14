import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { UnifiedGraph } from '../../../src/components/graph/UnifiedGraph';
import type { GraphNode, GraphEdge } from '../../../src/types/graph';

const mockNodes: GraphNode[] = [
  {
    id: 'session:1',
    label: 'Test Session',
    type: 'session',
    color: '#6366f1',
    metadata: { entityType: 'session', slug: 'test-session', agent: 'coordinator', status: 'completed', createdAt: '2024-01-01' },
  },
  {
    id: 'topic:1',
    label: 'React Patterns',
    type: 'topic',
    color: '#22c55e',
    metadata: { entityType: 'topic', slug: 'react-patterns', category: 'development', type: 'article' },
  },
  {
    id: 'agent:1',
    label: 'Coordinator',
    type: 'agent',
    color: '#a855f7',
    metadata: { entityType: 'agent', slug: 'coordinator', tier: 'core', status: 'active' },
  },
];

const mockEdges: GraphEdge[] = [
  { source: 'session:1', target: 'topic:1', type: 'sourceSession' },
  { source: 'session:1', target: 'agent:1', type: 'agentsUsed' },
];

describe('UnifiedGraph', () => {
  it('renders empty state when no nodes', () => {
    render(
      <MemoryRouter>
        <UnifiedGraph nodes={[]} edges={[]} width={240} height={160} mode="mini" />
      </MemoryRouter>
    );

    expect(screen.getByText('No knowledge graph yet')).toBeInTheDocument();
  });

  it('renders full empty state message in full mode', () => {
    render(
      <MemoryRouter>
        <UnifiedGraph nodes={[]} edges={[]} width={800} height={600} mode="full" />
      </MemoryRouter>
    );

    expect(screen.getByText(/No knowledge graph yet. Knowledge will appear after/)).toBeInTheDocument();
  });

  it('renders SVG element when nodes exist', () => {
    render(
      <MemoryRouter>
        <UnifiedGraph nodes={mockNodes} edges={mockEdges} width={240} height={160} mode="mini" />
      </MemoryRouter>
    );

    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct number of nodes', () => {
    render(
      <MemoryRouter>
        <UnifiedGraph nodes={mockNodes} edges={mockEdges} width={240} height={160} mode="mini" />
      </MemoryRouter>
    );

    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(3);
  });

  it('renders correct number of edges', () => {
    render(
      <MemoryRouter>
        <UnifiedGraph nodes={mockNodes} edges={mockEdges} width={240} height={160} mode="mini" />
      </MemoryRouter>
    );

    const lines = document.querySelectorAll('line');
    expect(lines.length).toBe(2);
  });

  it('uses correct colors for node types', () => {
    render(
      <MemoryRouter>
        <UnifiedGraph nodes={mockNodes} edges={mockEdges} width={240} height={160} mode="mini" />
      </MemoryRouter>
    );

    const circles = document.querySelectorAll('circle');
    const colors = Array.from(circles).map((c) => c.getAttribute('fill'));
    expect(colors).toContain('#6366f1'); // session
    expect(colors).toContain('#22c55e'); // topic
    expect(colors).toContain('#a855f7'); // agent
  });

  it('calls onNodeClick when node is clicked', async () => {
    const handleClick = vi.fn();
    render(
      <MemoryRouter>
        <UnifiedGraph
          nodes={mockNodes}
          edges={mockEdges}
          width={240}
          height={160}
          mode="mini"
          onNodeClick={handleClick}
        />
      </MemoryRouter>
    );

    const circles = document.querySelectorAll('circle');
    circles[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'session:1',
        label: 'Test Session',
        type: 'session',
      })
    );
  });

  it('navigates to correct route when node is clicked (default handler)', async () => {
    let currentPath = '';

    function LocationTracker() {
      const location = useLocation();
      currentPath = location.pathname;
      return null;
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <LocationTracker />
        <UnifiedGraph nodes={mockNodes} edges={mockEdges} width={240} height={160} mode="mini" />
      </MemoryRouter>
    );

    const circles = document.querySelectorAll('circle');
    circles[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await waitFor(() => {
      expect(currentPath).toBe('/sessions/1');
    });
  });
});
