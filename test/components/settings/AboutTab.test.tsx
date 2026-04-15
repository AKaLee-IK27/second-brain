import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AboutTab } from '../../../src/components/settings/AboutTab';
import { api } from '../../../src/services/api';

// Mock the api client
vi.mock('../../../src/services/api', () => ({
  api: {
    config: {
      getDataRoot: vi.fn(),
    },
  },
}));

describe('AboutTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays app name and description', () => {
    vi.mocked(api.config.getDataRoot).mockResolvedValue({ path: '/test/path' });

    render(<AboutTab />);
    expect(screen.getByText('Monolithic Lexicon')).toBeInTheDocument();
    expect(screen.getByText(/read-only React dashboard/i)).toBeInTheDocument();
  });

  it('displays version from env', () => {
    vi.mocked(api.config.getDataRoot).mockResolvedValue({ path: '/test/path' });

    render(<AboutTab />);
    // Version should be displayed (either from env or fallback "unknown")
    expect(screen.getByText('vunknown')).toBeInTheDocument();
  });

  it('displays data root path from API', async () => {
    vi.mocked(api.config.getDataRoot).mockResolvedValue({ path: '/Users/test/knowledge' });

    render(<AboutTab />);
    await waitFor(() => {
      expect(screen.getByText('/Users/test/knowledge')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    vi.mocked(api.config.getDataRoot).mockRejectedValue(new Error('Failed'));

    render(<AboutTab />);
    await waitFor(() => {
      expect(screen.getByText('Unable to load')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.mocked(api.config.getDataRoot).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AboutTab />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
