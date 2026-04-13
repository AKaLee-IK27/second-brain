// Agent types — mirrors server/types/index.ts

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

export interface AgentQueryParams {
  tier?: string;
  status?: string;
  [key: string]: string | number | undefined;
}
