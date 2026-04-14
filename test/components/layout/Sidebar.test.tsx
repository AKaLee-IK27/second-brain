import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Sidebar from '../../../src/components/layout/Sidebar';

// Mock the app store
vi.mock('../../../src/state/app-store', () => ({
  useAppStore: vi.fn(() => ({
    dataRoot: '/test/data',
    watcherStatus: 'watching',
  })),
}));

// Mock MaterialIcon component
vi.mock('../../../src/components/shared/MaterialIcon', () => ({
  MaterialIcon: ({ name, size }: { name: string; size: number }) => (
    <span data-testid={`icon-${name}`} style={{ width: size }}>
      {name}
    </span>
  ),
}));

function renderWithRouter(ui: React.ReactElement, initialPath = '/') {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        {children}
      </MemoryRouter>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenCode Collapsible Group', () => {
    it('renders OpenCode group instead of separate Agents, Skills, Configs items', () => {
      renderWithRouter(<Sidebar collapsed={false} />);

      expect(screen.getByText('OpenCode')).toBeInTheDocument();
      expect(screen.queryByText('Agents')).not.toBeInTheDocument();
      expect(screen.queryByText('Skills')).not.toBeInTheDocument();
      expect(screen.queryByText('Configs')).not.toBeInTheDocument();
    });

    it('shows chevron icon for expand/collapse', () => {
      renderWithRouter(<Sidebar collapsed={false} />);

      expect(screen.getByTestId('icon-chevron_right')).toBeInTheDocument();
    });

    it('navigates to /opencode when clicking OpenCode label', async () => {
      let locationPathname = '';

      function LocationTracker() {
        const location = useLocation();
        locationPathname = location.pathname;
        return null;
      }

      renderWithRouter(
        <>
          <Sidebar collapsed={false} />
          <LocationTracker />
        </>,
        '/sessions'
      );

      const openCodeLabel = screen.getByText('OpenCode');
      fireEvent.click(openCodeLabel);

      expect(locationPathname).toBe('/opencode');
    });

    it('expands/collapses sub-items when clicking chevron without navigation', async () => {
      let locationPathname = '';

      function LocationTracker() {
        const location = useLocation();
        locationPathname = location.pathname;
        return null;
      }

      renderWithRouter(
        <>
          <Sidebar collapsed={false} />
          <LocationTracker />
        </>,
        '/sessions'
      );

      expect(screen.queryByText('Agents')).not.toBeInTheDocument();
      expect(screen.queryByText('Skills')).not.toBeInTheDocument();
      expect(screen.queryByText('Configs')).not.toBeInTheDocument();

      const chevron = screen.getByTestId('icon-chevron_right');
      fireEvent.click(chevron);

      expect(screen.getByText('Agents')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Configs')).toBeInTheDocument();

      expect(locationPathname).toBe('/sessions');
    });

    it('highlights OpenCode group when any sub-route is active', () => {
      renderWithRouter(<Sidebar collapsed={false} />, '/agents');

      const openCodeGroup = screen.getByText('OpenCode').closest('div');
      expect(openCodeGroup).toHaveClass('border-primary-container');
    });

    it('navigates to /agents when clicking Agents sub-item', async () => {
      let locationPathname = '';

      function LocationTracker() {
        const location = useLocation();
        locationPathname = location.pathname;
        return null;
      }

      renderWithRouter(
        <>
          <Sidebar collapsed={false} />
          <LocationTracker />
        </>,
        '/sessions'
      );

      const chevron = screen.getByTestId('icon-chevron_right');
      fireEvent.click(chevron);

      const agentsLink = screen.getByText('Agents').closest('a');
      if (agentsLink) {
        fireEvent.click(agentsLink);
      }

      await waitFor(() => {
        expect(locationPathname).toBe('/agents');
      });
    });

    it('navigates to /skills when clicking Skills sub-item', async () => {
      let locationPathname = '';

      function LocationTracker() {
        const location = useLocation();
        locationPathname = location.pathname;
        return null;
      }

      renderWithRouter(
        <>
          <Sidebar collapsed={false} />
          <LocationTracker />
        </>,
        '/sessions'
      );

      const chevron = screen.getByTestId('icon-chevron_right');
      fireEvent.click(chevron);

      const skillsLink = screen.getByText('Skills').closest('a');
      if (skillsLink) {
        fireEvent.click(skillsLink);
      }

      await waitFor(() => {
        expect(locationPathname).toBe('/skills');
      });
    });

    it('navigates to /configs when clicking Configs sub-item', async () => {
      let locationPathname = '';

      function LocationTracker() {
        const location = useLocation();
        locationPathname = location.pathname;
        return null;
      }

      renderWithRouter(
        <>
          <Sidebar collapsed={false} />
          <LocationTracker />
        </>,
        '/sessions'
      );

      const chevron = screen.getByTestId('icon-chevron_right');
      fireEvent.click(chevron);

      const configsLink = screen.getByText('Configs').closest('a');
      if (configsLink) {
        fireEvent.click(configsLink);
      }

      await waitFor(() => {
        expect(locationPathname).toBe('/configs');
      });
    });
  });
});
