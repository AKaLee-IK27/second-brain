import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KnowledgeSnippetCard } from '../../../src/components/knowledge/KnowledgeSnippetCard';
import { KnowledgeSnippetsList } from '../../../src/components/knowledge/KnowledgeSnippetsList';
import { KnowledgeBadge } from '../../../src/components/knowledge/KnowledgeBadge';
import type { KnowledgeSnippet } from '../../../src/types/knowledge';

const mockFinding: KnowledgeSnippet = {
  id: 'session-1-finding-0',
  sessionId: 'session-1',
  sessionSlug: 'test-session',
  sessionTitle: 'Test Session',
  type: 'finding',
  content: 'React 19 supports server components natively',
  sourceSection: 'Key Findings',
  createdAt: Date.now(),
};

const mockFile: KnowledgeSnippet = {
  id: 'session-1-file-0',
  sessionId: 'session-1',
  sessionSlug: 'test-session',
  sessionTitle: 'Test Session',
  type: 'file',
  content: 'src/components/App.tsx',
  sourceSection: 'Files Modified',
  createdAt: Date.now(),
};

const mockAction: KnowledgeSnippet = {
  id: 'session-1-action-0',
  sessionId: 'session-1',
  sessionSlug: 'test-session',
  sessionTitle: 'Test Session',
  type: 'action',
  content: 'Add unit tests for the new component',
  sourceSection: 'Next Steps',
  createdAt: Date.now(),
};

describe('KnowledgeSnippetCard', () => {
  it('renders a finding snippet with correct type badge', () => {
    render(<KnowledgeSnippetCard snippet={mockFinding} />);

    expect(screen.getByText('Finding')).toBeInTheDocument();
    expect(screen.getByText('from Key Findings')).toBeInTheDocument();
    expect(screen.getByText('React 19 supports server components natively')).toBeInTheDocument();
  });

  it('renders a file snippet with correct type badge', () => {
    render(<KnowledgeSnippetCard snippet={mockFile} />);

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('from Files Modified')).toBeInTheDocument();
    expect(screen.getByText('src/components/App.tsx')).toBeInTheDocument();
  });

  it('renders an action snippet with correct type badge', () => {
    render(<KnowledgeSnippetCard snippet={mockAction} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('from Next Steps')).toBeInTheDocument();
    expect(screen.getByText('Add unit tests for the new component')).toBeInTheDocument();
  });
});

describe('KnowledgeSnippetsList', () => {
  it('renders loading skeleton when loading', () => {
    render(<KnowledgeSnippetsList snippets={[]} loading />);

    expect(screen.queryByText('Key Findings')).not.toBeInTheDocument();
  });

  it('renders empty state when no snippets', () => {
    render(<KnowledgeSnippetsList snippets={[]} />);

    expect(screen.getByText('No knowledge extracted from this session.')).toBeInTheDocument();
  });

  it('groups snippets by type with section headers', () => {
    const snippets = [mockFinding, mockFile, mockAction];
    render(<KnowledgeSnippetsList snippets={snippets} />);

    expect(screen.getByText('Key Findings (1)')).toBeInTheDocument();
    expect(screen.getByText('Files Modified (1)')).toBeInTheDocument();
    expect(screen.getByText('Next Steps (1)')).toBeInTheDocument();
  });

  it('only renders sections that have snippets', () => {
    const snippets = [mockFinding];
    render(<KnowledgeSnippetsList snippets={snippets} />);

    expect(screen.getByText('Key Findings (1)')).toBeInTheDocument();
    expect(screen.queryByText('Files Modified (1)')).not.toBeInTheDocument();
    expect(screen.queryByText('Next Steps (1)')).not.toBeInTheDocument();
  });

  it('renders snippet cards within each section', () => {
    const snippets = [mockFinding];
    render(<KnowledgeSnippetsList snippets={snippets} />);

    expect(screen.getByText('React 19 supports server components natively')).toBeInTheDocument();
  });
});

describe('KnowledgeBadge', () => {
  it('renders count when greater than 0', () => {
    render(<KnowledgeBadge count={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('findings')).toBeInTheDocument();
  });

  it('renders singular "finding" when count is 1', () => {
    render(<KnowledgeBadge count={1} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('finding')).toBeInTheDocument();
  });

  it('renders nothing when count is 0', () => {
    const { container } = render(<KnowledgeBadge count={0} />);

    expect(container.firstChild).toBeNull();
  });
});
