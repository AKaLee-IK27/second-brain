export interface GraphNode {
  id: string;
  label: string;
  type: 'session' | 'topic' | 'agent' | 'skill';
  color: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'relatedSessions' | 'relatedTopics' | 'sourceSession' | 'agentsUsed' | 'skillsUsed';
}
