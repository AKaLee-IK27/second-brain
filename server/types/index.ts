// Shared TypeScript types for AKL's Knowledge server

// ─── Session Types ───────────────────────────────────────────────────────────

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

export interface SessionDetail {
  frontmatter: SessionFrontmatter;
  body: string;
  raw: string;
}

// ─── Agent Types ─────────────────────────────────────────────────────────────

export type AgentType = 'coordinator' | 'specialist' | 'executor';
export type AgentTier = 'core' | 'specialist' | 'utility';
export type AgentStatus = 'active' | 'deprecated' | 'experimental';

export interface AgentFrontmatter {
  id: string;
  name: string;
  slug: string;
  type: AgentType;
  tier: AgentTier;
  status: AgentStatus;
  emoji?: string;
  number?: string;
  model?: string;
  shortDescription?: string;
  whenToUse: string;
  sessionsCount?: number;
  version: number;
}

export interface AgentSummary {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  number?: string;
  tier: AgentTier;
  status: AgentStatus;
  model?: string;
  shortDescription?: string;
  sessionsCount?: number;
}

export interface AgentDetail {
  frontmatter: AgentFrontmatter;
  body: string;
}

// ─── Skill Types ─────────────────────────────────────────────────────────────

export type SkillStatus = 'active' | 'deprecated' | 'experimental';

export interface SkillFrontmatter {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: SkillStatus;
  emoji?: string;
  shortDescription?: string;
  whenToUse: string;
  scope?: string;
  compatibleAgents?: string[];
  usageCount?: number;
  version: number;
}

export interface SkillSummary {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  category: string;
  status: SkillStatus;
  shortDescription?: string;
  compatibleAgents?: string[];
}

export interface SkillDetail {
  frontmatter: SkillFrontmatter;
  body: string;
}

// ─── Topic Types ─────────────────────────────────────────────────────────────

export type TopicType = 'article' | 'blog' | 'research-note' | 'tutorial' | 'reference' | 'meeting-note' | 'idea';
export type TopicStatus = 'draft' | 'published' | 'archived';

export interface TopicFrontmatter {
  id: string;
  slug: string;
  title: string;
  type: TopicType;
  category: string;
  status: TopicStatus;
  summary?: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
  author?: string;
  relatedTopics?: string[];
  sourceSession?: string;
  version: number;
}

export interface TopicSummary {
  id: string;
  slug: string;
  title: string;
  type: TopicType;
  category: string;
  status: TopicStatus;
  summary?: string;
  createdAt: string;
  readTime?: number;
  tags?: string[];
}

export interface TopicDetail {
  frontmatter: TopicFrontmatter;
  body: string;
}

export interface TopicCategory {
  slug: string;
  count: number;
}

// ─── Config Types ────────────────────────────────────────────────────────────

export type ConfigType = 'opencode' | 'skill' | 'agent' | 'theme' | 'environment';
export type ConfigScope = 'global' | 'project' | 'user';

export interface ConfigFrontmatter {
  id: string;
  name: string;
  slug: string;
  type: ConfigType;
  scope: ConfigScope;
  description?: string;
  sourcePath: string;
  lastSynced: string;
  version: number;
}

export interface ConfigSummary {
  id: string;
  name: string;
  slug: string;
  type: ConfigType;
  scope: ConfigScope;
  lastSynced: string;
}

export interface ConfigDetail {
  frontmatter: ConfigFrontmatter;
  body: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiMeta {
  timestamp: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Error Codes ─────────────────────────────────────────────────────────────

export type ErrorCode =
  | 'DATA_ROOT_NOT_SET'
  | 'DATA_ROOT_INVALID'
  | 'FILE_NOT_FOUND'
  | 'INVALID_FRONTMATTER'
  | 'PATH_TRAVERSAL'
  | 'MIGRATION_IN_PROGRESS'
  | 'SQLITE_NOT_FOUND'
  | 'INTERNAL_ERROR';

// ─── Error Code to HTTP Status Mapping ───────────────────────────────────────

export const ERROR_CODE_HTTP_STATUS: Record<ErrorCode, number> = {
  DATA_ROOT_NOT_SET: 400,
  DATA_ROOT_INVALID: 400,
  FILE_NOT_FOUND: 404,
  INVALID_FRONTMATTER: 422,
  PATH_TRAVERSAL: 403,
  MIGRATION_IN_PROGRESS: 409,
  SQLITE_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

// ─── Session Query Params ────────────────────────────────────────────────────

export interface SessionQueryParams {
  page?: number;
  limit?: number;
  agent?: string;
  status?: string;
  tags?: string; // comma-separated
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SessionsListResponse {
  sessions: SessionSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface SessionsMetaResponse {
  agents: string[];
  statuses: string[];
  tags: string[];
  dateRange: {
    min: string;
    max: string;
  };
}

// ─── Config API Types ────────────────────────────────────────────────────────

export interface DataRootResponse {
  path: string | null;
}

export interface ValidateRootRequest {
  path: string;
}

export interface ValidateRootResponse {
  valid: boolean;
  contentTypes: string[];
  error?: string;
}

// ─── Parsed File Result ──────────────────────────────────────────────────────

export interface ParsedMarkdownFile {
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
  filePath: string;
}
