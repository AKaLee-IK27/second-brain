import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MigrationProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  current: number;
  total: number;
  errors: string[];
  startedAt?: number;
  completedAt?: number;
}

interface MessageData {
  parentID?: string;
  role: string;
  mode?: string;
  agent?: string;
  path?: { cwd: string; root: string };
  cost?: number;
  tokens?: {
    total: number;
    input: number;
    output: number;
    reasoning: number;
    cache?: { write: number; read: number };
  };
  modelID?: string;
  providerID?: string;
  time?: { created: number; completed?: number };
  finish?: string;
  summary?: { diffs: string[] };
  error?: string;
}

interface PartData {
  type: string;
  text?: string;
  tool?: string;
  callID?: string;
  state?: {
    status: string;
    input?: unknown;
    output?: unknown;
    metadata?: unknown;
    title?: string;
    time?: { start: number; end?: number; compacted?: number };
  };
  mime?: string;
  filename?: string;
  url?: string;
  hash?: string;
  files?: string[];
  name?: string;
  source?: { value: string; start: number; end: number };
  time?: { start: number; end?: number };
}

interface SessionRow {
  id: string;
  project_id: string;
  parent_id: string | null;
  slug: string;
  directory: string;
  title: string;
  version: string;
  share_url: string | null;
  summary_additions: number | null;
  summary_deletions: number | null;
  summary_files: number | null;
  summary_diffs: string | null;
  revert: string | null;
  permission: string | null;
  time_created: number;
  time_updated: number;
  time_compacting: number | null;
  time_archived: number | null;
  workspace_id: string | null;
  project_name: string | null;
  project_worktree: string | null;
}

interface MessageRow {
  id: string;
  session_id: string;
  time_created: number;
  time_updated: number;
  data: string;
}

interface PartRow {
  id: string;
  message_id: string;
  session_id: string;
  time_created: number;
  time_updated: number;
  data: string;
}

// ─── Path Safety ─────────────────────────────────────────────────────────────

/**
 * Validates that the output path does not contain path traversal sequences.
 * Returns the resolved safe path or throws.
 */
function validateOutputPath(outputRoot: string): string {
  const resolved = path.resolve(outputRoot);

  // Reject paths containing traversal sequences
  if (outputRoot.includes('..')) {
    throw new Error('Output path must not contain ".." sequences');
  }

  return resolved;
}

// ─── YAML Escaping ───────────────────────────────────────────────────────────

/**
 * Escapes a string for safe inclusion in YAML frontmatter.
 * Handles quotes, newlines, and special characters.
 */
function escapeYaml(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');
}

/**
 * Escapes a string for safe inclusion in markdown body.
 */
function escapeMarkdown(str: string): string {
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// ─── Migration Engine ────────────────────────────────────────────────────────

export class MigrationEngine {
  private progress: MigrationProgress = { status: 'idle', current: 0, total: 0, errors: [] };
  private dbPath: string;
  private outputRoot: string | null = null;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(homedir(), '.local/share/opencode/opencode.db');
  }

  setOutputRoot(root: string) {
    this.outputRoot = validateOutputPath(root);
  }

  getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  /**
   * Runs the full migration from SQLite to markdown files.
   * Each session is processed independently — one failure does not stop the rest.
   */
  async run(dryRun: boolean = false): Promise<MigrationProgress> {
    this.progress = {
      status: 'running',
      current: 0,
      total: 0,
      errors: [],
      startedAt: Date.now(),
    };

    try {
      // Validate output path
      if (!this.outputRoot) {
        this.progress = {
          status: 'failed',
          current: 0,
          total: 0,
          errors: ['Output root not set. Call setOutputRoot() before running migration.'],
          startedAt: this.progress.startedAt,
          completedAt: Date.now(),
        };
        return this.progress;
      }

      // Verify SQLite exists
      if (!fs.existsSync(this.dbPath)) {
        this.progress = {
          status: 'failed',
          current: 0,
          total: 0,
          errors: [`SQLite database not found at ${this.dbPath}`],
          startedAt: this.progress.startedAt,
          completedAt: Date.now(),
        };
        return this.progress;
      }

      const db = new Database(this.dbPath, { readonly: true });

      // Get all sessions with project info
      const sessions = db
        .prepare(
          `
        SELECT s.*, p.name as project_name, p.worktree as project_worktree
        FROM session s
        LEFT JOIN project p ON s.project_id = p.id
        ORDER BY s.time_created ASC
      `,
        )
        .all() as SessionRow[];

      this.progress.total = sessions.length;

      // Prepare statements once for performance
      const getMessages = db.prepare(
        'SELECT * FROM message WHERE session_id = ? ORDER BY time_created ASC, rowid ASC',
      );
      const getParts = db.prepare(
        'SELECT * FROM part WHERE message_id = ? ORDER BY rowid ASC',
      );

      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i]!;
        try {
          // Get messages for this session
          const messages = getMessages.all(session.id) as MessageRow[];

          // Enrich messages with their parts
          const messagesWithParts = messages.map((msg) => {
            const parts = getParts.all(msg.id) as PartRow[];
            const parsedParts: PartData[] = [];
            for (const p of parts) {
              try {
                parsedParts.push(JSON.parse(p.data) as PartData);
              } catch {
                // Skip unparseable parts
              }
            }

            let msgData: MessageData;
            try {
              msgData = JSON.parse(msg.data) as MessageData;
            } catch {
              msgData = { role: 'unknown' };
            }

            return { row: msg, data: msgData, parts: parsedParts };
          });

          // Generate markdown content
          const markdown = this.generateMarkdown(session, messagesWithParts);

          // Determine output path: {dataRoot}/sessions/YYYY-MM/YYYY-MM-DD-slug.md
          const createdDate = new Date(session.time_created);
          const yearMonth = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
          const day = String(createdDate.getDate()).padStart(2, '0');
          const fileName = `${yearMonth}-${day}-${this.sanitizeFileName(session.slug)}.md`;
          const dirPath = path.join(this.outputRoot, 'sessions', yearMonth);
          const filePath = path.join(dirPath, fileName);

          if (!dryRun) {
            fs.mkdirSync(dirPath, { recursive: true });
            fs.writeFileSync(filePath, markdown, 'utf-8');
          }

          this.progress.current = i + 1;
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.progress.errors.push(
            `Session ${session.id.slice(0, 12)}... (${session.slug}): ${errMsg}`,
          );
          this.progress.current = i + 1;
        }
      }

      db.close();

      this.progress.status = 'completed';
      this.progress.completedAt = Date.now();
    } catch (err) {
      this.progress.status = 'failed';
      this.progress.errors.push(err instanceof Error ? err.message : String(err));
      this.progress.completedAt = Date.now();
    }

    return this.progress;
  }

  /**
   * Generates a markdown document from a session and its messages.
   */
  private generateMarkdown(
    session: SessionRow,
    messages: Array<{ row: MessageRow; data: MessageData; parts: PartData[] }>,
  ): string {
    const created = new Date(session.time_created);
    const updated = new Date(session.time_updated);

    // Aggregate token and cost data from messages
    let totalInput = 0;
    let totalOutput = 0;
    let totalReasoning = 0;
    let totalCost = 0;
    const agents = new Set<string>();
    const models = new Set<string>();
    const providers = new Set<string>();

    for (const msg of messages) {
      const d = msg.data;
      if (d.tokens) {
        totalInput += d.tokens.input ?? 0;
        totalOutput += d.tokens.output ?? 0;
        totalReasoning += d.tokens.reasoning ?? 0;
      }
      if (typeof d.cost === 'number') totalCost += d.cost;
      if (d.agent) agents.add(d.agent);
      if (d.modelID) models.add(d.modelID);
      if (d.providerID) providers.add(d.providerID);
    }

    const totalTokens = totalInput + totalOutput + totalReasoning;
    const primaryAgent = agents.size > 0 ? Array.from(agents)[0]! : 'unknown';
    const primaryModel = models.size > 0 ? Array.from(models)[0]! : 'unknown';

    // Build frontmatter
    const frontmatter = [
      '---',
      `id: "${escapeYaml(session.id)}"`,
      `slug: "${escapeYaml(session.slug)}"`,
      `title: "${escapeYaml(session.title)}"`,
      `directory: "${escapeYaml(session.directory)}"`,
      `agent: "${primaryAgent}"`,
      `model: "${primaryModel}"`,
      `createdAt: "${created.toISOString()}"`,
      `updatedAt: "${updated.toISOString()}"`,
      'tokens:',
      `  input: ${totalInput}`,
      `  output: ${totalOutput}`,
      `  reasoning: ${totalReasoning}`,
      `  total: ${totalTokens}`,
      `cost: ${totalCost.toFixed(6)}`,
      `status: "completed"`,
      'tags: []',
      'version: 1',
      '---',
    ].join('\n');

    // Build body
    const lines: string[] = ['', `# ${session.title}`, ''];

    // Session metadata section
    lines.push('## Session Info', '');
    lines.push(`- **Directory:** \`${escapeMarkdown(session.directory)}\``);
    if (session.project_name) {
      lines.push(`- **Project:** ${escapeMarkdown(session.project_name)}`);
    }
    if (session.project_worktree) {
      lines.push(`- **Worktree:** \`${escapeMarkdown(session.project_worktree)}\``);
    }
    lines.push(`- **Created:** ${created.toISOString()}`);
    lines.push(`- **Updated:** ${updated.toISOString()}`);
    lines.push(`- **Agent:** ${Array.from(agents).join(', ') || 'unknown'}`);
    lines.push(
      `- **Tokens:** ${totalTokens.toLocaleString()} (input: ${totalInput.toLocaleString()}, output: ${totalOutput.toLocaleString()}, reasoning: ${totalReasoning.toLocaleString()})`,
    );
    lines.push(`- **Cost:** $${totalCost.toFixed(6)}`);
    lines.push(
      `- **Git Changes:** +${session.summary_additions ?? 0} -${session.summary_deletions ?? 0} (${session.summary_files ?? 0} files)`,
    );
    if (session.share_url) {
      lines.push(`- **Share URL:** ${session.share_url}`);
    }
    lines.push('');

    // Conversation section
    lines.push('---', '');
    lines.push('## Conversation', '');

    for (const msg of messages) {
      const d = msg.data;
      const roleLabel =
        d.role === 'user'
          ? 'User'
          : `Assistant (${d.agent ?? d.mode ?? 'unknown'})`;
      const msgTime = d.time?.created
        ? new Date(d.time.created).toLocaleTimeString()
        : new Date(msg.row.time_created).toLocaleTimeString();

      lines.push(`### ${roleLabel} — ${msgTime}`, '');

      // Render each part
      for (const part of msg.parts) {
        this.renderPart(lines, part);
      }

      lines.push('---', '');
    }

    return frontmatter + lines.join('\n');
  }

  /**
   * Renders a single part into the markdown lines array.
   */
  private renderPart(lines: string[], part: PartData): void {
    switch (part.type) {
      case 'text':
        if (part.text) {
          lines.push(escapeMarkdown(part.text));
          lines.push('');
        }
        break;

      case 'reasoning':
        if (part.text) {
          lines.push('*Reasoning:*');
          lines.push(escapeMarkdown(part.text));
          lines.push('');
        }
        break;

      case 'tool': {
        const toolName = part.tool ?? 'unknown';
        const title = part.state?.title;
        lines.push(`**Tool:** \`${toolName}\`${title ? ` — ${escapeMarkdown(title)}` : ''}`, '');

        if (part.state?.input) {
          lines.push('```json');
          lines.push(JSON.stringify(part.state.input, null, 2));
          lines.push('```');
          lines.push('');
        }

        if (part.state?.output !== undefined && part.state.output !== null) {
          lines.push('**Output:**');
          lines.push('```');
          lines.push(
            typeof part.state.output === 'string'
              ? escapeMarkdown(part.state.output)
              : JSON.stringify(part.state.output, null, 2),
          );
          lines.push('```');
          lines.push('');
        }
        break;
      }

      case 'file':
        if (part.filename || part.url) {
          lines.push(`**File:** \`${escapeMarkdown(part.filename ?? part.url ?? '')}\``);
          if (part.mime) {
            lines.push(`- **MIME:** ${part.mime}`);
          }
          lines.push('');
        }
        break;

      case 'patch':
        if (part.hash) {
          lines.push(`**Patch:** \`${part.hash}\``);
          if (part.files && part.files.length > 0) {
            lines.push('**Files:**');
            for (const f of part.files) {
              lines.push(`- \`${escapeMarkdown(f)}\``);
            }
          }
          lines.push('');
        }
        break;

      case 'agent':
        if (part.name) {
          lines.push(`**Sub-agent:** \`${part.name}\`${part.source ? ` (${escapeMarkdown(part.source.value)})` : ''}`, '');
        }
        break;

      case 'step-start':
      case 'step-finish':
        // Skip structural markers — they don't add content value
        break;

      case 'subtask':
        if (part.text) {
          lines.push(`**Subtask:** ${escapeMarkdown(part.text)}`, '');
        }
        break;

      default:
        // Unknown part type — include raw data for debugging
        lines.push(`**[${part.type}]**`, '');
        lines.push('```json');
        lines.push(JSON.stringify(part, null, 2));
        lines.push('```');
        lines.push('');
        break;
    }
  }

  /**
   * Sanitizes a filename to remove characters that are unsafe for filesystems.
   */
  private sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
}

export const migrationEngine = new MigrationEngine();
