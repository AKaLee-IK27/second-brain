import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OpenCodePage from '../../src/routes/OpenCodePage';
import { HubSummaryCard } from '../../src/components/opencode/HubSummaryCard';

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    agents: {
      list: vi.fn().mockResolvedValue({
        agents: [
          { id: 'agent-1', name: 'Coordinator', slug: 'coordinator', tier: 'core' },
          { id: 'agent-2', name: 'Specialist', slug: 'specialist', tier: 'specialist' },
        ],
      }),
    },
    skills: {
      list: vi.fn().mockResolvedValue({
        skills: [
          { id: 'skill-1', name: 'Dev', slug: 'dev', category: 'development' },
          { id: 'skill-2', name: 'Arch', slug: 'arch', category: 'architecture' },
        ],
      }),
    },
    configs: {
      list: vi.fn().mockResolvedValue({
        configs: [
          { id: 'config-1', name: 'opencode', slug: 'opencode', scope: 'global' },
        ],
      }),
    },
  },
}));

vi.mock('../../src/services/api', () => ({
  api: mockApi,
}));

describe('OpenCode Hub Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hub page with title', async () => {
    render(
      <MemoryRouter initialEntries={['/opencode']}>
        <Routes>
          <Route path="/opencode" element={<OpenCodePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('OpenCode Hub')).toBeInTheDocument();
    });
  });

  it('displays summary cards for Agents, Skills, and Configs', async () => {
    render(
      <MemoryRouter initialEntries={['/opencode']}>
        <Routes>
          <Route path="/opencode" element={<OpenCodePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Agents')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Configs')).toBeInTheDocument();
    });
  });

  it('shows correct counts on summary cards', async () => {
    render(
      <MemoryRouter initialEntries={['/opencode']}>
        <Routes>
          <Route path="/opencode" element={<OpenCodePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('2 agents')).toBeInTheDocument();
      expect(screen.getByText('2 skills')).toBeInTheDocument();
      expect(screen.getByText('1 config')).toBeInTheDocument();
    });
  });

  it('shows "View All" links', async () => {
    render(
      <MemoryRouter initialEntries={['/opencode']}>
        <Routes>
          <Route path="/opencode" element={<OpenCodePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const viewAllLinks = screen.getAllByText('View All →');
      expect(viewAllLinks).toHaveLength(3);
    });
  });
});

describe('HubSummaryCard', () => {
  it('renders card with title, count, and View All link', () => {
    render(
      <MemoryRouter>
        <HubSummaryCard
          title="Agents"
          count={5}
          entityType="agent"
          topItems={[
            { label: 'Coordinator', subtitle: 'core' },
            { label: 'Specialist', subtitle: 'specialist' },
          ]}
          viewAllPath="/agents"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('5 agents')).toBeInTheDocument();
    expect(screen.getByText('View All →')).toBeInTheDocument();
    expect(screen.getByText('Coordinator')).toBeInTheDocument();
    expect(screen.getByText('Specialist')).toBeInTheDocument();
  });

  it('shows empty state when count is 0', () => {
    render(
      <MemoryRouter>
        <HubSummaryCard
          title="Agents"
          count={0}
          entityType="agent"
          topItems={[]}
          viewAllPath="/agents"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('0 agents')).toBeInTheDocument();
    expect(screen.getByText('No agents found')).toBeInTheDocument();
  });

  it('shows empty state for skills when count is 0', () => {
    render(
      <MemoryRouter>
        <HubSummaryCard
          title="Skills"
          count={0}
          entityType="skill"
          topItems={[]}
          viewAllPath="/skills"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('No skills found')).toBeInTheDocument();
  });

  it('shows empty state for configs when count is 0', () => {
    render(
      <MemoryRouter>
        <HubSummaryCard
          title="Configs"
          count={0}
          entityType="config"
          topItems={[]}
          viewAllPath="/configs"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('No configs found')).toBeInTheDocument();
  });

  it('navigates to view all path when clicking View All link', () => {
    const { container } = render(
      <MemoryRouter>
        <HubSummaryCard
          title="Agents"
          count={5}
          entityType="agent"
          topItems={[]}
          viewAllPath="/agents"
        />
      </MemoryRouter>
    );

    const viewAllLink = container.querySelector('a');
    expect(viewAllLink).toHaveAttribute('href', '/agents');
  });
});
