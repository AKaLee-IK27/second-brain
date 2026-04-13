// Config types — mirrors server/types/index.ts

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

export interface ConfigsListResponse {
  configs: ConfigSummary[];
}
