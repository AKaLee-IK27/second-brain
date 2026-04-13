import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export interface ServerConfig {
  port: number;
  host: string;
  dataRoot: string | null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const persistPath = path.join(__dirname, '.data-root.json');

// Load persisted data root if it exists
let savedDataRoot: string | null = null;
try {
  if (fs.existsSync(persistPath)) {
    const saved = JSON.parse(fs.readFileSync(persistPath, 'utf-8'));
    savedDataRoot = saved.dataRoot || null;
  }
} catch { /* ignore */ }

// In-memory configuration
const config: ServerConfig = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  host: '127.0.0.1',
  dataRoot: savedDataRoot,
};

export function getConfig(): ServerConfig {
  return { ...config };
}

export function getDataRoot(): string | null {
  return config.dataRoot;
}

export function setDataRoot(rootPath: string): void {
  config.dataRoot = path.resolve(rootPath);
  // Persist to disk
  try {
    fs.writeFileSync(persistPath, JSON.stringify({ dataRoot: config.dataRoot }), 'utf-8');
  } catch { /* ignore */ }
}

export function clearDataRoot(): void {
  config.dataRoot = null;
  try {
    if (fs.existsSync(persistPath)) fs.unlinkSync(persistPath);
  } catch { /* ignore */ }
}

export { config };
