import type { NoteRecord, LinkRecord, ParaCategory } from './note';

export interface GraphNode {
  id: string;
  title: string;
  paraCategory: ParaCategory;
  degree: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacency: Map<string, string[]>;
}

export function buildGraphData(notes: NoteRecord[], links: LinkRecord[]): GraphData {
  const noteIds = new Set(notes.map((n) => n.id));

  // Build adjacency
  const adjacency = new Map<string, string[]>();
  for (const note of notes) {
    adjacency.set(note.id, []);
  }

  // Filter valid edges (both source and target exist)
  const edges: GraphEdge[] = [];
  for (const link of links) {
    if (noteIds.has(link.fromNoteId) && noteIds.has(link.toNoteId)) {
      edges.push({ source: link.fromNoteId, target: link.toNoteId });
      adjacency.get(link.fromNoteId)?.push(link.toNoteId);
      adjacency.get(link.toNoteId)?.push(link.fromNoteId);
    }
  }

  // Build nodes with degree
  const nodes: GraphNode[] = notes.map((note) => ({
    id: note.id,
    title: note.title,
    paraCategory: note.paraCategory,
    degree: adjacency.get(note.id)?.length ?? 0,
  }));

  return { nodes, edges, adjacency };
}

export const PARA_NODE_COLORS: Record<ParaCategory, string> = {
  projects: '#FFE951',
  areas: '#51C4F5',
  resources: '#50D890',
  archives: '#888888',
};
