// Search types — derived from SRS Section 7.2 API specification

export type SearchContentType = 'session' | 'agent' | 'skill' | 'topic' | 'config';

export interface SearchResult {
  type: SearchContentType;
  id: string;
  title: string;
  preview: string;
  score: number;
  category?: string;
  slug?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total?: number;
}

export interface SearchRequest {
  query: string;
  type?: SearchContentType;
  limit?: number;
}

export interface SearchIndexStatus {
  indexed: number;
  lastBuilt: string;
}
