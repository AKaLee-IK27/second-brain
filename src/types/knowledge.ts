export interface KnowledgeSnippet {
  id: string;
  sessionId: string;
  sessionSlug: string;
  sessionTitle: string;
  type: 'finding' | 'file' | 'action';
  content: string;
  sourceSection: string;
  createdAt: number;
}
