// API client service for AKL's Knowledge
// Communicates with the Node.js bridge server at http://127.0.0.1:3001

import type { ErrorCode, ApiSuccessResponse, ApiErrorResponse } from '../types/api';
import type {
  SessionData,
  SessionsListResponse,
  SessionMeta,
  SessionQueryParams,
} from '../types/session';
import type {
  AgentSummary,
  AgentDetail,
  AgentQueryParams,
} from '../types/agent';
import type {
  SkillSummary,
  SkillDetail,
  SkillQueryParams,
} from '../types/skill';
import type {
  TopicDetail,
  TopicCategory,
  TopicsListResponse,
  TopicQueryParams,
} from '../types/topic';
import type {
  ConfigDetail,
  ConfigsListResponse,
} from '../types/config';
import type {
  StatsSummary,
  StatsTimelineResponse,
  StatsByAgentResponse,
  StatsTopTagsResponse,
  StatsTimelineParams,
} from '../types/stats';
import type {
  SearchResponse,
  SearchRequest,
  SearchIndexStatus,
} from '../types/search';
import type {
  Vault,
  SyncPreview,
  SyncResult,
} from '../types/vault';
import type { KnowledgeSnippet } from '../types/knowledge';
import type { GraphNode, GraphEdge } from '../types/graph';

interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  counts: { sessions: number; topics: number; agents: number; skills: number };
}

interface SessionBacklinks {
  sessions: Array<{ id: string; slug: string; title: string; relationship: 'relatedSessions' | 'parentSession' }>;
  topics: Array<{ id: string; slug: string; title: string; relationship: 'sourceSession' }>;
}

interface TopicBacklinks {
  sessions: Array<{ id: string; slug: string; title: string }>;
  topics: Array<{ id: string; slug: string; title: string }>;
}

interface UsedInResponse {
  sessions: Array<{ id: string; slug: string; title: string; createdAt: string }>;
  totalCount: number;
}

// ─── Error Class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public code: ErrorCode | string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Configuration ────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3001';

// ─── Core Request Function ────────────────────────────────────────────────────

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data: ApiSuccessResponse<T> | ApiErrorResponse = await response.json();

  if (!data.success) {
    throw new ApiError(data.error.code, data.error.message, data.error.details);
  }

  return data.data;
}

// ─── Query String Builder ─────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)] as [string, string]);
  const query = new URLSearchParams(entries);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const api = {
  // ── Config ────────────────────────────────────────────────────────────────

  config: {
    getDataRoot: () =>
      request<{ path: string | null }>('/api/config/data-root'),

    setDataRoot: (path: string) =>
      request<{ path: string }>('/api/config/data-root', {
        method: 'POST',
        body: JSON.stringify({ path }),
      }),

    validateRoot: (path: string) =>
      request<{ valid: boolean; contentTypes: string[]; error?: string }>(
        '/api/config/validate-root',
        {
          method: 'POST',
          body: JSON.stringify({ path }),
        },
      ),
  },

  // ── Sessions ──────────────────────────────────────────────────────────────

  sessions: {
    list: (params?: SessionQueryParams) => {
      const qs = buildQuery(params ?? {});
      return request<SessionsListResponse>(`/api/sessions${qs}`);
    },

    meta: () => request<SessionMeta>('/api/sessions/meta'),

    get: (id: string) => request<SessionData>(`/api/sessions/${id}`),
  },

  // ── Agents ────────────────────────────────────────────────────────────────

  agents: {
    list: (params?: AgentQueryParams) => {
      const qs = buildQuery(params ?? {});
      return request<{ agents: AgentSummary[] }>(`/api/agents${qs}`);
    },

    get: (slug: string) => request<AgentDetail>(`/api/agents/${slug}`),
  },

  // ── Skills ────────────────────────────────────────────────────────────────

  skills: {
    list: (params?: SkillQueryParams) => {
      const qs = buildQuery(params ?? {});
      return request<{ skills: SkillSummary[] }>(`/api/skills${qs}`);
    },

    get: (slug: string) => request<SkillDetail>(`/api/skills/${slug}`),
  },

  // ── Topics ────────────────────────────────────────────────────────────────

  topics: {
    list: (params?: TopicQueryParams) => {
      const qs = buildQuery(params ?? {});
      return request<TopicsListResponse>(`/api/topics${qs}`);
    },

    categories: () =>
      request<{ categories: TopicCategory[] }>('/api/topics/categories'),

    get: (slug: string) => request<TopicDetail>(`/api/topics/${slug}`),
  },

  // ── Configs ───────────────────────────────────────────────────────────────

  configs: {
    list: () => request<ConfigsListResponse>('/api/configs'),

    get: (slug: string) => request<ConfigDetail>(`/api/configs/${slug}`),
  },

  // ── Stats ─────────────────────────────────────────────────────────────────

  stats: {
    summary: () => request<StatsSummary>('/api/stats/summary'),

    timeline: (params?: StatsTimelineParams) => {
      const qs = buildQuery(params ?? {});
      return request<StatsTimelineResponse>(`/api/stats/timeline${qs}`);
    },

    byAgent: () => request<StatsByAgentResponse>('/api/stats/by-agent'),

    topTags: (limit?: number) => {
      const qs = limit ? `?limit=${limit}` : '';
      return request<StatsTopTagsResponse>(`/api/stats/top-tags${qs}`);
    },
  },

  // ── Search ────────────────────────────────────────────────────────────────

  search: {
    query: (body: SearchRequest) =>
      request<SearchResponse>('/api/search', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    indexStatus: () => request<SearchIndexStatus>('/api/search/index'),

    rebuild: () =>
      request<SearchIndexStatus>('/api/search/rebuild', {
        method: 'POST',
      }),
  },

  // ── Vaults ────────────────────────────────────────────────────────────────

  vaults: {
    list: () =>
      request<{ vaults: Vault[] }>('/api/vaults'),

    add: (path: string) =>
      request<{ vault: Vault }>('/api/vaults', {
        method: 'POST',
        body: JSON.stringify({ path }),
      }),

    remove: (id: string) =>
      request<{ success: true }>(`/api/vaults/${id}`, {
        method: 'DELETE',
      }),

    preview: () =>
      request<{ preview: SyncPreview }>('/api/vaults/preview', {
        method: 'POST',
      }),

    sync: () =>
      request<{ result: SyncResult }>('/api/vaults/sync', {
        method: 'POST',
      }),
  },

  // ── Migration ─────────────────────────────────────────────────────────────

  migration: {
    start: (body: {
      sqlitePath: string;
      outputRoot: string;
      dryRun: boolean;
    }) =>
      request<{ migrationId: string; status: string }>('/api/migrate/start', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    status: () =>
      request<{
        migrationId: string;
        status: string;
        progress: number;
        total: number;
      }>('/api/migrate/status'),

    report: () =>
      request<{
        status: string;
        migrated: number;
        failed: number;
        errors: string[];
        duration: string;
      }>('/api/migrate/report'),
  },

  knowledge: {
    list: (params?: { type?: string; sessionId?: string }) => {
      const qs = buildQuery(params ?? {});
      return request<{
        snippets: KnowledgeSnippet[];
        total: number;
        byType: { findings: number; files: number; actions: number };
      }>(`/api/knowledge${qs}`);
    },

    bySession: (sessionId: string) =>
      request<KnowledgeSnippet[]>(`/api/knowledge/session/${sessionId}`),

    stats: () =>
      request<{
        total: number;
        byType: { findings: number; files: number; actions: number };
      }>('/api/knowledge/stats'),
  },

  // ── Graph ─────────────────────────────────────────────────────────────────

  graph: {
    get: (params?: { types?: string; days?: number }) => {
      const qs = buildQuery(params ?? {});
      return request<GraphResponse>(`/api/graph${qs}`);
    },
  },

  // ── Backlinks ─────────────────────────────────────────────────────────────

  backlinks: {
    getSession: (sessionId: string) =>
      request<SessionBacklinks>(`/api/backlinks/session/${sessionId}`),

    getTopic: (topicSlug: string) =>
      request<TopicBacklinks>(`/api/backlinks/topic/${topicSlug}`),

    getAgentUsedIn: (agentSlug: string, limit?: number) => {
      const qs = limit ? `?limit=${limit}` : '';
      return request<UsedInResponse>(`/api/backlinks/agent/${agentSlug}/used-in${qs}`);
    },

    getSkillUsedIn: (skillSlug: string, limit?: number) => {
      const qs = limit ? `?limit=${limit}` : '';
      return request<UsedInResponse>(`/api/backlinks/skill/${skillSlug}/used-in${qs}`);
    },
  },
};

export default api;
