// Skill types — mirrors server/types/index.ts

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

export interface SkillQueryParams {
  category?: string;
  status?: string;
  [key: string]: string | number | undefined;
}
