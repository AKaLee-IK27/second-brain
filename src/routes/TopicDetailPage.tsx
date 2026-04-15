import { useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { MaterialIcon } from '../components/shared/MaterialIcon';
import { ArticleOutline } from '../components/shared/ArticleOutline';
import { extractHeadings } from '../utils/headingUtils';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useHeadingScroll, buildHeadingIdMap } from '../hooks/useHeadingScroll';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  article: 'bg-primary/10 text-primary border-primary/20',
  blog: 'bg-sb-purple/10 text-sb-purple border-sb-purple/20',
  tutorial: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  'research-note': 'bg-secondary/10 text-secondary border-secondary/20',
  reference: 'bg-outline-variant/10 text-on-surface-variant border-outline-variant/20',
};

export default function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useApi(
    () => api.topics.get(slug!),
    [slug],
  );

  const { data: backlinks, loading: backlinksLoading } = useApi(
    () => api.backlinks.getTopic(slug!),
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
        action={{ label: 'Back to Topics', onClick: () => window.history.back() }}
      />
    );
  if (!data)
    return (
      <EmptyState
        title="Topic not found"
        description=""
        action={{ label: 'Back to Topics', onClick: () => window.history.back() }}
      />
    );

  const { frontmatter } = data;
  const sourceSession = frontmatter.sourceSession as string | undefined;
  const relatedTopics = frontmatter.relatedTopics as string[] | undefined;

  const wordCount = body.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex h-full">
      {/* Center Panel: Article Body */}
      <div ref={contentContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-12 py-8">
          {/* Header Metadata */}
          <div className="mb-12 font-mono text-[11px] uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MaterialIcon name="calendar_today" size={14} />
                {frontmatter.createdAt ? format(new Date(frontmatter.createdAt), 'yyyy-MM-dd') : 'Unknown'}
              </span>
              {frontmatter.readTime && (
                <span className="flex items-center gap-1">
                  <MaterialIcon name="schedule" size={14} />
                  {frontmatter.readTime} MIN READ
                </span>
              )}
              {frontmatter.type && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase border ${typeColors[frontmatter.type] || typeColors.article}`}>
                  {frontmatter.type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">{slug}</span>
            </div>
          </div>

          {/* Markdown Content */}
          <article className="markdown-body">
            <h1>{frontmatter.title}</h1>
            {frontmatter.summary && (
              <p className="font-serif text-xl text-on-surface-variant leading-relaxed mb-8 italic">
                {frontmatter.summary}
              </p>
            )}
            <MarkdownRenderer content={body} headingIds={headingIdsMap} />
          </article>

          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="mt-20 pt-8 border-t border-outline-variant/15 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {frontmatter.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-surface-container text-primary text-[10px] font-mono rounded border border-outline-variant/20 hover:border-primary/50 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Session */}
          {sourceSession && (
            <div className="mt-8 p-4 bg-surface-container rounded-lg border border-outline-variant/10">
              <h3 className="text-sm font-medium text-on-surface font-headline mb-2">Source</h3>
              <Link to={`/sessions/${sourceSession}`} className="text-sm text-primary hover:underline">
                View source session →
              </Link>
            </div>
          )}

          {/* Related Topics */}
          {relatedTopics && relatedTopics.length > 0 && (
            <div className="mt-8 p-4 bg-surface-container rounded-lg border border-outline-variant/10">
              <h3 className="text-sm font-medium text-on-surface font-headline mb-2">Related Topics</h3>
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

          {/* Referenced By */}
          {!backlinksLoading && backlinks && (backlinks.sessions.length > 0 || backlinks.topics.length > 0) && (
            <div className="mt-8 p-4 bg-surface-container rounded-lg border border-outline-variant/10 space-y-3">
              <h3 className="text-sm font-medium text-on-surface font-headline">Referenced By</h3>
              {backlinks.sessions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant">Sessions:</span>
                  <div className="space-y-1">
                    {backlinks.sessions.map((s) => (
                      <Link
                        key={s.id}
                        to={`/sessions/${s.id}`}
                        className="block text-sm text-primary hover:underline"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {backlinks.topics.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-on-surface-variant">Topics:</span>
                  <div className="flex flex-wrap gap-2">
                    {backlinks.topics.map((t) => (
                      <Link
                        key={t.id}
                        to={`/topics/${t.slug}`}
                        className="px-2 py-0.5 text-xs bg-surface-container-high text-on-surface-variant rounded-full hover:bg-surface-container-high/80 transition-colors"
                      >
                        {t.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
              <span className="text-[10px] font-mono text-outline-variant">TYPE</span>
              <span className="text-[10px] font-mono text-primary capitalize">{frontmatter.type || 'article'}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-outline-variant">CATEGORY</span>
              <span className="text-[10px] font-mono text-on-surface capitalize">{frontmatter.category || '—'}</span>
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
