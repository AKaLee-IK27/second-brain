import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { useKnowledge } from '../hooks/useKnowledge';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { KnowledgeSnippetsList } from '../components/knowledge/KnowledgeSnippetsList';
import { MaterialIcon } from '../components/shared/MaterialIcon';
import { format } from 'date-fns';

function statusBadgeColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'running':
      return 'bg-sb-warning/15 text-sb-warning';
    case 'completed':
    case 'done':
      return 'bg-outline-variant/15 text-outline-variant';
    case 'review':
      return 'bg-primary-container/15 text-primary-container';
    case 'error':
    case 'failed':
      return 'bg-error/15 text-error';
    default:
      return 'bg-outline-variant/15 text-outline-variant';
  }
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: session, loading, error } = useApi(
    () => api.sessions.get(id!),
    [id]
  );

  const { snippets, loading: knowledgeLoading } = useKnowledge(id);

  if (loading) return <LoadingSkeleton lines={15} />;
  if (error) return <EmptyState title="Error" description={error.message} action={{ label: "Back to Sessions", onClick: () => navigate('/sessions') }} />;
  if (!session) return <EmptyState title="Session not found" description="" action={{ label: "Back to Sessions", onClick: () => navigate('/sessions') }} />;

  const { frontmatter, body } = session;
  const relatedTopics = frontmatter.relatedTopics;
  const parentSession = frontmatter.parentSession;

  // Extract headings for outline
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: { level: number; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(body)) !== null) {
    headings.push({ level: match[1].length, text: match[2] });
  }

  // Estimate word count and read time
  const wordCount = body.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex h-full">
      {/* Center Panel: Article Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-12 py-8">
          {/* Session Header Metadata */}
          <div className="mb-12 font-mono text-[11px] uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MaterialIcon name="calendar_today" size={14} />
                {format(new Date(frontmatter.createdAt), 'yyyy-MM-dd')}
              </span>
              <span className="flex items-center gap-1">
                <MaterialIcon name="schedule" size={14} />
                {format(new Date(frontmatter.createdAt), 'HH:mm')}
              </span>
              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full ${statusBadgeColor(frontmatter.status)}`}>
                  {frontmatter.tags[0]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">ID: {id}</span>
            </div>
          </div>

          {/* Markdown Content Body */}
          <article className="markdown-body">
            <h1>{frontmatter.title}</h1>
            <MarkdownRenderer content={body} />
          </article>

          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="mt-20 pt-8 border-t border-outline-variant/15 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {frontmatter.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface-container text-primary text-[10px] font-mono rounded border border-outline-variant/20 hover:border-primary/50 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Knowledge */}
          {(relatedTopics?.length || parentSession) && (
            <div className="mt-8 p-4 bg-surface-container rounded-lg border border-outline-variant/10 space-y-3">
              <h3 className="text-sm font-medium text-on-surface font-headline">Related Knowledge</h3>
              {parentSession && (
                <div className="text-sm">
                  <span className="text-on-surface-variant">Parent session: </span>
                  <Link to={`/sessions/${parentSession}`} className="text-primary hover:underline">
                    {parentSession}
                  </Link>
                </div>
              )}
              {relatedTopics && relatedTopics.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm text-on-surface-variant">Related topics:</span>
                  <div className="flex flex-wrap gap-2">
                    {relatedTopics.map((topic) => (
                      <Link
                        key={topic}
                        to={`/topics/${topic}`}
                        className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Knowledge Extracted */}
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-medium text-on-surface font-headline">Knowledge Extracted</h3>
            <KnowledgeSnippetsList snippets={snippets} loading={knowledgeLoading} />
          </div>
        </div>
      </div>

      {/* Right Panel: Metadata Rail */}
      <aside className="w-80 bg-surface-container-lowest/30 px-6 py-8 flex flex-col gap-10 overflow-y-auto border-l border-outline-variant/10">
        {/* Outline */}
        {headings.length > 0 && (
          <section>
            <h3 className="font-mono text-[10px] text-outline-variant uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
              <span>Outline</span>
              <MaterialIcon name="segment" size={14} />
            </h3>
            <ul className="flex flex-col gap-3 font-headline text-sm text-on-surface-variant">
              {headings.map((h, i) => (
                <li
                  key={i}
                  className={`hover:text-primary cursor-pointer transition-colors flex items-center gap-2 ${h.level > 1 ? 'pl-4 border-l border-outline-variant/20' : ''}`}
                >
                  {h.level === 1 && <span className="w-1 h-1 bg-primary-container rounded-full" />}
                  {h.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Stats */}
        <section className="mt-auto">
          <div className="bg-surface-container-high rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-outline-variant">WORD_COUNT</span>
              <span className="text-[10px] font-mono text-on-surface">{wordCount}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-outline-variant">READ_TIME</span>
              <span className="text-[10px] font-mono text-on-surface">{readTime} MIN</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-outline-variant">TOKENS</span>
              <span className="text-[10px] font-mono text-on-surface">{frontmatter.tokens.total?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-outline-variant">COST</span>
              <span className="text-[10px] font-mono text-tertiary">${frontmatter.cost?.toFixed(2)}</span>
            </div>
            <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary-container w-2/3" />
            </div>
            <div className="mt-2 text-[8px] font-mono text-outline-variant text-right">SYNC_STATUS: VERIFIED</div>
          </div>
        </section>
      </aside>
    </div>
  );
}
