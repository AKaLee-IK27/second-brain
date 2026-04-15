import { useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { SmartIcon } from '../components/shared/AgentIcons';
import { ArticleOutline } from '../components/shared/ArticleOutline';
import { extractHeadings } from '../utils/headingUtils';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useHeadingScroll, buildHeadingIdMap } from '../hooks/useHeadingScroll';
import { formatDistanceToNow } from 'date-fns';

const tierColors: Record<string, string> = {
  core: 'bg-secondary/15 text-secondary border-secondary/20',
  specialist: 'bg-primary/15 text-primary border-primary/20',
  utility: 'bg-tertiary/15 text-tertiary border-tertiary/20',
};

export default function AgentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useApi(
    () => api.agents.get(slug!),
    [slug],
  );

  const { data: usedIn } = useApi(
    () => api.backlinks.getAgentUsedIn(slug!),
    [slug],
  );

  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Extract headings with IDs - memoized to prevent re-computation on every render
  // MUST be called before early returns to satisfy Rules of Hooks
  const body = data?.body ?? '';
  const headings = useMemo(() => extractHeadings(body), [body]);

  // Build heading ID map for MarkdownRenderer - memoized to prevent re-creating Map
  const headingIdsMap = useMemo(() => buildHeadingIdMap(headings), [headings]);

  // Active heading tracking - memoized array to prevent useEffect re-runs
  const headingIdList = useMemo(() => headings.map((h) => h.id), [headings]);
  const activeHeadingId = useScrollSpy(contentContainerRef, headingIdList);

  // Scroll to heading on click
  const handleHeadingClick = useHeadingScroll(contentContainerRef);

  // Early returns AFTER all hooks
  if (loading) return <LoadingSkeleton lines={15} />;
  if (error)
    return (
      <EmptyState
        title="Error"
        description={error.message}
        action={{ label: 'Back to Agents', onClick: () => window.history.back() }}
      />
    );
  if (!data)
    return (
      <EmptyState
        title="Agent not found"
        description=""
        action={{ label: 'Back to Agents', onClick: () => window.history.back() }}
      />
    );

  const { frontmatter } = data;

  return (
    <div className="flex h-full">
      {/* Center Panel: Agent Profile */}
      <div ref={contentContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-12 py-8">
          {/* Agent Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-primary">
                <SmartIcon emoji={frontmatter.emoji} size={48} className="w-12 h-12" />
              </div>
              <div>
                <h1 className="font-headline text-3xl font-bold text-on-surface">{frontmatter.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-sm text-primary">{frontmatter.model}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold tracking-widest border ${tierColors[frontmatter.tier] || tierColors.utility}`}>
                    {frontmatter.tier?.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-tertiary/15 text-tertiary border border-tertiary/20">
                    {frontmatter.status}
                  </span>
                </div>
              </div>
            </div>
            {frontmatter.whenToUse && (
              <p className="font-serif text-lg text-on-surface-variant leading-relaxed italic">
                {frontmatter.whenToUse}
              </p>
            )}
          </div>

          {/* Markdown Content */}
          <article className="markdown-body">
            <MarkdownRenderer content={body} headingIds={headingIdsMap} />
          </article>

          {/* Used In */}
          {usedIn && usedIn.sessions.length > 0 && (
            <div className="mt-12 p-6 bg-surface-container rounded-lg border border-outline-variant/10">
              <h3 className="font-headline text-sm font-semibold text-on-surface mb-4">
                Used In ({usedIn.totalCount} sessions)
              </h3>
              <div className="space-y-2">
                {usedIn.sessions.slice(0, 10).map((session) => (
                  <Link
                    key={session.id}
                    to={`/sessions/${session.id}`}
                    className="block p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <div className="text-sm text-on-surface font-headline">{session.title}</div>
                    <div className="text-xs text-on-surface-variant font-mono mt-1">
                      {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Metadata Rail */}
      <aside className="w-80 bg-surface-container-lowest/30 px-6 py-8 flex flex-col gap-10 overflow-y-auto border-l border-outline-variant/10">
        {/* Outline */}
        <ArticleOutline
          headings={headings}
          activeHeadingId={activeHeadingId}
          onHeadingClick={handleHeadingClick}
        />

        {/* Agent Profile */}
        <section>
          <h3 className="font-mono text-[10px] text-outline-variant uppercase tracking-[0.2em] mb-4">Agent Profile</h3>
          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Model</span>
              <span className="text-on-surface">{frontmatter.model || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Tier</span>
              <span className="text-primary capitalize">{frontmatter.tier || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Status</span>
              <span className="text-tertiary capitalize">{frontmatter.status || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Sessions</span>
              <span className="text-on-surface">{usedIn?.totalCount || 0}</span>
            </div>
          </div>
        </section>

        <section className="mt-auto">
          <div className="bg-surface-container-high rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-outline-variant">AGENT ID</span>
              <span className="text-[10px] font-mono text-primary">{slug}</span>
            </div>
            <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary-container w-3/4" />
            </div>
            <div className="mt-2 text-[8px] font-mono text-outline-variant text-right">STATUS: ACTIVE</div>
          </div>
        </section>
      </aside>
    </div>
  );
}
