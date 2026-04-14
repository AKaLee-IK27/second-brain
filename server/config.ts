import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { ServerConfig, Vault, VaultConfig } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const persistPath = path.join(__dirname, '.data-root.json');

// ─── Persistence Helpers ─────────────────────────────────────────────────────

function loadVaultConfig(): VaultConfig {
  try {
    if (fs.existsSync(persistPath)) {
      const saved = JSON.parse(fs.readFileSync(persistPath, 'utf-8'));
      return {
        dataRoot: saved.dataRoot || null,
        vaults: Array.isArray(saved.vaults) ? saved.vaults : [],
      };
    }
  } catch { /* ignore */ }
  return { dataRoot: null, vaults: [] };
}

function saveVaultConfig(vaultConfig: VaultConfig): void {
  try {
    fs.writeFileSync(persistPath, JSON.stringify(vaultConfig), 'utf-8');
  } catch { /* ignore */ }
}

// ─── Load persisted data root ────────────────────────────────────────────────

const savedConfig = loadVaultConfig();

// ─── In-memory configuration ─────────────────────────────────────────────────

const config: ServerConfig = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  host: '127.0.0.1',
  dataRoot: savedConfig.dataRoot,
};

export function getConfig(): ServerConfig {
  return { ...config };
}

export function getDataRoot(): string | null {
  return config.dataRoot;
}

export function setDataRoot(rootPath: string): void {
  config.dataRoot = path.resolve(rootPath);
  const vaultConfig = loadVaultConfig();
  vaultConfig.dataRoot = config.dataRoot;
  saveVaultConfig(vaultConfig);
}

export function clearDataRoot(): void {
  config.dataRoot = null;
  try {
    if (fs.existsSync(persistPath)) fs.unlinkSync(persistPath);
  } catch { /* ignore */ }
}

// ─── Vault Management ────────────────────────────────────────────────────────

export function getVaults(): Vault[] {
  return loadVaultConfig().vaults;
}

export function addVault(vault: Vault): void {
  const vaultConfig = loadVaultConfig();
  vaultConfig.vaults.push(vault);
  saveVaultConfig(vaultConfig);
}

export function removeVault(vaultId: string): boolean {
  const vaultConfig = loadVaultConfig();
  const before = vaultConfig.vaults.length;
  vaultConfig.vaults = vaultConfig.vaults.filter((v) => v.id !== vaultId);
  if (vaultConfig.vaults.length < before) {
    saveVaultConfig(vaultConfig);
    return true;
  }
  return false;
}

export { config };
