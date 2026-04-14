import type { KnowledgeSnippet } from '../../types/knowledge';
import { KnowledgeSnippetCard } from './KnowledgeSnippetCard';

interface KnowledgeSnippetsListProps {
  snippets: KnowledgeSnippet[];
  loading?: boolean;
}

const sectionOrder: Array<{ type: KnowledgeSnippet['type']; title: string }> = [
  { type: 'finding', title: 'Key Findings' },
  { type: 'file', title: 'Files Modified' },
  { type: 'action', title: 'Next Steps' },
];

export function KnowledgeSnippetsList({
  snippets,
  loading = false,
}: KnowledgeSnippetsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-sb-surface-alt rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-sb-surface-alt rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (snippets.length === 0) {
    return (
      <div className="sb-card p-4">
        <p className="text-sm text-sb-text-muted">
          No knowledge extracted from this session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sectionOrder.map((section) => {
        const sectionSnippets = snippets.filter((s) => s.type === section.type);
        if (sectionSnippets.length === 0) return null;

        return (
          <div key={section.type} className="space-y-2">
            <h4 className="text-sm font-medium text-sb-text">
              {section.title} ({sectionSnippets.length})
            </h4>
            <div className="space-y-2">
              {sectionSnippets.map((snippet) => (
                <KnowledgeSnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
