import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/shared/MarkdownRenderer';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { SmartIcon, Wrench } from '../components/shared/AgentIcons';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  active: 'bg-tertiary/15 text-tertiary border-tertiary/20',
  deprecated: 'bg-error/15 text-error border-error/20',
  experimental: 'bg-secondary/15 text-secondary border-secondary/20',
};

export default function SkillDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useApi(
    () => api.skills.get(slug!),
    [slug],
  );

  const { data: usedIn } = useApi(
    () => api.backlinks.getSkillUsedIn(slug!),
    [slug],
  );

  if (loading) return <LoadingSkeleton lines={15} />;
  if (error)
    return (
      <EmptyState
        title="Error"
        description={error.message}
        action={{ label: 'Back to Skills', onClick: () => window.history.back() }}
      />
    );
  if (!data)
    return (
      <EmptyState
        title="Skill not found"
        description=""
        action={{ label: 'Back to Skills', onClick: () => window.history.back() }}
      />
    );

  const { frontmatter, body } = data;

  return (
    <div className="flex h-full">
      {/* Center Panel: Skill Profile */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-12 py-8">
          {/* Skill Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-tertiary">
                <SmartIcon emoji={frontmatter.emoji} size={48} className="w-12 h-12" defaultIcon={Wrench} />
              </div>
              <div>
                <h1 className="font-headline text-3xl font-bold text-on-surface">{frontmatter.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-sm text-on-surface-variant capitalize">{frontmatter.category}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold tracking-widest border capitalize ${statusColors[frontmatter.status] || statusColors.active}`}>
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
            <MarkdownRenderer content={body} />
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
        <section>
          <h3 className="font-mono text-[10px] text-outline-variant uppercase tracking-[0.2em] mb-4">Skill Profile</h3>
          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Category</span>
              <span className="text-on-surface capitalize">{frontmatter.category || '—'}</span>
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
              <span className="text-[10px] font-mono text-outline-variant">SKILL ID</span>
              <span className="text-[10px] font-mono text-primary">{slug}</span>
            </div>
            <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container w-3/4" />
            </div>
            <div className="mt-2 text-[8px] font-mono text-outline-variant text-right">STATUS: ACTIVE</div>
          </div>
        </section>
      </aside>
    </div>
  );
}
