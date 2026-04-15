import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function AboutTab() {
  const [dataRoot, setDataRoot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchConfig = async () => {
      try {
        const result = await api.config.getDataRoot();
        if (!cancelled) {
          setDataRoot(result.path);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchConfig();
    return () => { cancelled = true; };
  }, []);

  const version = import.meta.env.PACKAGE_VERSION || 'unknown';
  const repositoryUrl = import.meta.env.REPOSITORY_URL;

  return (
    <div className="p-4 space-y-4">
      {/* App Name */}
      <div>
        <h3 className="font-headline text-xl font-bold text-on-surface">
          Monolithic Lexicon
        </h3>
        <p className="font-mono text-sm text-on-surface-variant mt-1">
          v{version}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-on-surface-variant">
        A read-only React dashboard that visualizes opencode AI session data
      </p>

      {/* Repository Link (conditional) */}
      {repositoryUrl && (
        <div>
          <span className="text-sm font-medium text-on-surface-variant">Repository: </span>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {repositoryUrl}
          </a>
        </div>
      )}

      {/* Data Root Path */}
      <div>
        <span className="text-sm font-medium text-on-surface-variant">Data Root: </span>
        {loading ? (
          <span className="text-sm text-on-surface-variant">Loading...</span>
        ) : error ? (
          <span className="text-sm text-on-surface-variant">Unable to load</span>
        ) : (
          <span className="font-mono text-sm text-on-surface">{dataRoot}</span>
        )}
      </div>
    </div>
  );
}
