// Topic types — mirrors server/types/index.ts

export type TopicType =
  | 'article'
  | 'blog'
  | 'research-note'
  | 'tutorial'
  | 'reference'
  | 'meeting-note'
  | 'idea';

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

export interface TopicsListResponse {
  topics: TopicSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface TopicQueryParams {
  category?: string;
  type?: string;
  status?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}
