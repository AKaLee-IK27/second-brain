import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { MaterialIcon } from '../components/shared/MaterialIcon';
import { format } from 'date-fns';

const paraColors: Record<string, { border: string; text: string; bg: string }> = {
  projects: { border: 'border-sb-projects', text: 'text-sb-projects', bg: 'bg-sb-projects/10' },
  areas: { border: 'border-sb-areas', text: 'text-sb-areas', bg: 'bg-sb-areas/10' },
  resources: { border: 'border-sb-resources', text: 'text-sb-resources', bg: 'bg-sb-resources/10' },
  archives: { border: 'border-sb-archive', text: 'text-sb-archive', bg: 'bg-sb-archive/10' },
};

const typeColors: Record<string, string> = {
  article: 'bg-primary/10 text-primary border-primary/20',
  blog: 'bg-sb-purple/10 text-sb-purple border-sb-purple/20',
  tutorial: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  'research-note': 'bg-secondary/10 text-secondary border-secondary/20',
  reference: 'bg-outline-variant/10 text-on-surface-variant border-outline-variant/20',
};

export default function TopicsPage() {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  const { data: topicsData, loading: tLoading } = useApi(
    () =>
      api.topics.list({
        category: category || undefined,
        type: type || undefined,
      }),
    [category, type],
  );

  const { data: categoriesData } = useApi(
    () => api.topics.categories(),
    [],
  );

  const topics = topicsData?.topics || [];
  const categories = categoriesData?.categories || [];

  if (tLoading) return <LoadingSkeleton lines={8} />;

  const totalTopics = categories.reduce((sum, c) => sum + c.count, 0);
  const featuredTopic = topics[0];
  const regularTopics = topics.slice(1);

  return (
    <div className="flex h-full">
      {/* Left Panel: PARA Category Sidebar */}
      <aside className="w-64 bg-surface-container-low flex flex-col p-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-widest mb-4">Categorization</h3>
          <nav className="space-y-4">
            {['projects', 'areas', 'resources', 'archives'].map((cat) => {
              const colors = paraColors[cat];
              const catData = categories.find(c => c.slug === cat);
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(isActive ? '' : cat)}
                  className={`group w-full flex items-center justify-between p-3 rounded-lg transition-all border-l-4 ${colors.border} ${
                    isActive ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-headline text-sm font-bold ${colors.text} capitalize`}>{cat}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      {cat === 'projects' ? 'Active momentum' : cat === 'areas' ? 'Responsibilities' : cat === 'resources' ? 'Reference material' : 'Dormant history'}
                    </span>
                  </div>
                  <span className={`font-mono text-xs ${colors.text}`}>{catData?.count || 0}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Type Filter */}
        <div>
          <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-widest mb-4">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {['', 'article', 'blog', 'tutorial', 'research-note', 'reference'].map((t) => (
              <button
                key={t}
                onClick={() => setType(type === t ? '' : t)}
                className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors capitalize ${
                  type === t
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20 hover:text-primary'
                }`}
              >
                {t || 'All'}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Center Panel: Magazine Grid */}
      <section className="flex-1 bg-background overflow-y-auto px-10 py-8">
        <header className="mb-12">
          <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter mb-2">Knowledge Topics</h1>
          <p className="font-mono text-sm text-primary">
            {totalTopics} topics indexed — Last synced recently
          </p>
        </header>

        {topics.length === 0 ? (
          <EmptyState
            title="No topics found"
            description="Knowledge articles will appear here once created."
          />
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Featured Card */}
            {featuredTopic && (
              <article className="col-span-12 group cursor-pointer">
                <Link to={`/topics/${featuredTopic.slug}`} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-outline-variant/10 pb-12">
                  <div className="aspect-[16/10] bg-surface-container-low rounded-xl overflow-hidden relative border border-outline-variant/10 flex items-center justify-center">
                    <MaterialIcon name="topic" size={64} className="text-outline-variant/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <span className={`absolute top-4 left-4 px-3 py-1 ${paraColors[featuredTopic.category]?.bg || 'bg-primary/10'} ${paraColors[featuredTopic.category]?.text || 'text-primary'} text-[10px] font-headline font-bold uppercase rounded-full backdrop-blur-md border ${paraColors[featuredTopic.category]?.border || 'border-primary/30'}`}>
                      {featuredTopic.category || 'Article'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] text-outline">
                      <span>{featuredTopic.createdAt ? format(new Date(featuredTopic.createdAt), 'MMM d, yyyy') : 'Recent'}</span>
                      <span className="w-1 h-1 bg-outline-variant rounded-full" />
                      <span>{featuredTopic.readTime || 5} MIN READ</span>
                    </div>
                    <h2 className="font-headline text-3xl font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                      {featuredTopic.title}
                    </h2>
                    {featuredTopic.summary && (
                      <p className="font-serif text-lg text-on-surface-variant leading-relaxed">
                        {featuredTopic.summary}
                      </p>
                    )}
                    <div className="pt-2">
                      <span className="flex items-center gap-2 text-primary font-headline text-sm font-bold group-hover:translate-x-2 transition-transform">
                        READ FULL ARTICLE
                        <MaterialIcon name="arrow_right_alt" size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {/* Regular Cards */}
            {regularTopics.map((topic) => (
              <article key={topic.slug} className="col-span-12 md:col-span-6 group cursor-pointer space-y-4 border-b border-outline-variant/10 pb-8">
                <Link to={`/topics/${topic.slug}`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 ${typeColors[topic.type] || typeColors.article} text-[10px] font-headline font-bold uppercase rounded border capitalize`}>
                      {topic.type || 'Article'}
                    </span>
                    <span className="font-mono text-[10px] text-outline">{topic.readTime || 5} MIN READ</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors mt-2">
                    {topic.title}
                  </h3>
                  {topic.summary && (
                    <p className="font-serif text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      {topic.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-outline">
                    {topic.createdAt && <span>{format(new Date(topic.createdAt), 'MMM d, yyyy')}</span>}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Right Panel: Metadata Rail */}
      <aside className="w-80 bg-surface-container-lowest border-l border-outline-variant/10 p-6 flex flex-col gap-8 overflow-y-auto hidden xl:flex">
        <div>
          <h4 className="font-headline text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Topic Metadata</h4>
          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Total Topics</span>
              <span className="text-on-surface">{totalTopics}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Categories</span>
              <span className="text-on-surface">{categories.length}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/5 pb-2">
              <span className="text-outline">Sync Status</span>
              <span className="text-tertiary">ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* Terminal Shell */}
        <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/10">
          <h4 className="font-headline text-[10px] font-bold text-on-surface uppercase tracking-widest mb-3 flex items-center gap-2">
            <MaterialIcon name="terminal" size={14} />
            Lexicon Shell
          </h4>
          <div className="font-mono text-[9px] text-tertiary space-y-1">
            <p>&gt; query topics --active</p>
            <p className="text-on-surface-variant">Scanning vault...</p>
            <p className="text-on-surface-variant">Found {totalTopics} matching nodes.</p>
            <p className="animate-pulse">_</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
