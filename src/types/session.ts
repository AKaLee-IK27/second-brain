// Session types — mirrors server/types/index.ts

export interface SessionTokens {
  input: number;
  output: number;
  reasoning: number;
  total: number;
}

export type SessionStatus = 'active' | 'completed' | 'failed' | 'abandoned';

export interface SessionFrontmatter {
  id: string;
  slug: string;
  title: string;
  agent: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  tokens: SessionTokens;
  cost: number;
  status: SessionStatus;
  tags?: string[];
  duration?: number;
  version: number;
  relatedSessions?: string[];
  parentSession?: string;
}

export interface SessionSummary {
  id: string;
  slug: string;
  title: string;
  agent: string;
  model: string;
  createdAt: string;
  tokens: SessionTokens;
  cost: number;
  status: SessionStatus;
  tags?: string[];
  duration?: number;
}

export interface SessionData {
  frontmatter: SessionFrontmatter;
  body: string;
  raw: string;
}

export interface SessionsListResponse {
  sessions: SessionSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface SessionMeta {
  agents: string[];
  statuses: string[];
  tags: string[];
  dateRange: { min: string; max: string };
}

export interface SessionQueryParams {
  page?: number;
  limit?: number;
  agent?: string;
  status?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}
