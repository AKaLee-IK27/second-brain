import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { KnowledgeSnippet } from '../types/knowledge';

interface UseKnowledgeResult {
  snippets: KnowledgeSnippet[];
  loading: boolean;
  error: Error | null;
  stats: { findings: number; files: number; actions: number };
  refetch: () => Promise<void>;
}

export function useKnowledge(sessionId?: string): UseKnowledgeResult {
  const [snippets, setSnippets] = useState<KnowledgeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: KnowledgeSnippet[];
      if (sessionId) {
        data = await api.knowledge.bySession(sessionId);
      } else {
        const response = await api.knowledge.list();
        data = response?.snippets ?? [];
      }
      setSnippets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch knowledge'));
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    findings: snippets.filter((s) => s.type === 'finding').length,
    files: snippets.filter((s) => s.type === 'file').length,
    actions: snippets.filter((s) => s.type === 'action').length,
  };

  return { snippets, loading, error, stats, refetch: fetchData };
}
