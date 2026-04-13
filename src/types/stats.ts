// Stats types — derived from SRS Section 7.2 API specification

export interface SessionTokens {
  input: number;
  output: number;
  reasoning: number;
  total: number;
}

export interface StatsSummary {
  totalSessions: number;
  totalTokens: SessionTokens;
  totalCost: number;
  avgCostPerSession: number;
  contentCounts: {
    sessions: number;
    agents: number;
    skills: number;
    topics: number;
    configs: number;
  };
}

export interface TimelineDataPoint {
  date: string;
  sessions: number;
  tokens: number;
  cost: number;
}

export interface StatsTimelineResponse {
  data: TimelineDataPoint[];
}

export interface AgentStat {
  agent: string;
  sessions: number;
  tokens: number;
  cost: number;
}

export interface StatsByAgentResponse {
  agents: AgentStat[];
}

export interface TagStat {
  name: string;
  count: number;
}

export interface StatsTopTagsResponse {
  tags: TagStat[];
}

export interface StatsTimelineParams {
  granularity?: 'day' | 'week' | 'month';
  range?: '7d' | '30d' | '90d' | 'all';
  [key: string]: string | number | undefined;
}
