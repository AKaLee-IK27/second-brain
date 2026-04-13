import yaml from 'js-yaml';

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>;
  body: string;
}

/**
 * Parses a markdown string, extracting YAML frontmatter and body.
 *
 * Frontmatter is delimited by `---` at the start of the file.
 * If no frontmatter is found, returns an empty frontmatter object.
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const trimmed = content.trim();

  // Check if content starts with frontmatter delimiter
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: content };
  }

  // Find the closing delimiter (--- on its own line, not inside quoted strings)
  const lines = trimmed.split('\n');
  let closingLineIndex = -1;
  let charOffset = (lines[0]?.length ?? 0) + 1; // Skip first --- line

  for (let i = 1; i < lines.length; i++) {
    if ((lines[i] ?? '').trim() === '---') {
      closingLineIndex = i;
      break;
    }
    charOffset += (lines[i]?.length ?? 0) + 1;
  }

  if (closingLineIndex === -1) {
    // No closing delimiter — treat entire content as body
    return { frontmatter: {}, body: content };
  }

  const frontmatterBlock = trimmed.substring(3, charOffset).trim();
  const body = trimmed.substring(charOffset + 3).trimStart();

  // Parse YAML frontmatter
  let frontmatter: Record<string, unknown>;
  try {
    const parsed = yaml.load(frontmatterBlock);
    frontmatter = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    // Invalid YAML — return empty frontmatter but preserve body
    frontmatter = {};
  }

  return { frontmatter, body };
}

/**
 * Parses YAML frontmatter string directly.
 * Throws on invalid YAML.
 */
export function parseFrontmatter(yamlContent: string): Record<string, unknown> {
  const parsed = yaml.load(yamlContent);

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }

  return {};
}
