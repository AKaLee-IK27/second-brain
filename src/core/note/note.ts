export type ParaCategory = 'projects' | 'areas' | 'resources' | 'archives';

export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  paraCategory: ParaCategory;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
}

export interface LinkRecord {
  id: string;
  fromNoteId: string;
  toNoteId: string;
  type: 'wikilink' | 'backlink' | 'explicit';
  createdAt: number;
}

export interface TagRecord {
  id: string;
  name: string;
  color: string | null;
}

export interface NoteTagRecord {
  noteId: string;
  tagId: string;
}

export const PARA_CATEGORIES: { key: ParaCategory; label: string; color: string }[] = [
  { key: 'projects', label: 'Projects', color: 'sb-card-projects' },
  { key: 'areas', label: 'Areas', color: 'sb-card-areas' },
  { key: 'resources', label: 'Resources', color: 'sb-card-resources' },
  { key: 'archives', label: 'Archive', color: 'sb-card-archive' },
];

export const PARA_COLORS: Record<ParaCategory, string> = {
  projects: 'var(--color-brut-projects)',
  areas: 'var(--color-brut-areas)',
  resources: 'var(--color-brut-resources)',
  archives: 'var(--color-brut-archive)',
};
