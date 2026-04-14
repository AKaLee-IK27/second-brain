import type { KnowledgeSnippet } from '../../types/knowledge';

interface KnowledgeSnippetCardProps {
  snippet: KnowledgeSnippet;
}

const typeConfig = {
  finding: {
    label: 'Finding',
    color: 'bg-sb-accent/20 text-sb-accent border-sb-accent/30',
  },
  file: {
    label: 'File',
    color: 'bg-sb-warning/20 text-sb-warning border-sb-warning/30',
  },
  action: {
    label: 'Action',
    color: 'bg-sb-success/20 text-sb-success border-sb-success/30',
  },
};

export function KnowledgeSnippetCard({ snippet }: KnowledgeSnippetCardProps) {
  const config = typeConfig[snippet.type];

  return (
    <div className="sb-card p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`px-1.5 py-0.5 text-xs border rounded-full ${config.color}`}>
          {config.label}
        </span>
        <span className="text-xs text-sb-text-muted">
          from {snippet.sourceSection}
        </span>
      </div>
      <p className="text-sm text-sb-text">{snippet.content}</p>
    </div>
  );
}
