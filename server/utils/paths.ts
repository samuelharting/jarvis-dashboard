import { join, isAbsolute } from 'path';
import { access } from 'fs/promises';
import { constants } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root is two levels up from /server/utils
const projectRoot = dirname(dirname(__dirname));

export const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const getDataRoot = (): string => {
  const envPath = process.env.JARVIS_DATA_ROOT;
  if (envPath) {
    return isAbsolute(envPath) ? envPath : join(projectRoot, envPath);
  }
  return join(projectRoot, 'data');
};

export const getOpenClawRoot = (): string | null => {
  const envPath = process.env.OPENCLAW_ROOT;
  if (!envPath) {
    return null;
  }
  return isAbsolute(envPath) ? envPath : join(projectRoot, envPath);
};

// Auto-detect paths with priority fallback
export const agentsFileAuto = async (): Promise<string> => {
  // Priority 1: Environment override
  if (process.env.OPENCLAW_AGENTS_PATH) {
    return process.env.OPENCLAW_AGENTS_PATH;
  }
  
  // Priority 2: OpenClaw root
  const openClawRoot = getOpenClawRoot();
  if (openClawRoot) {
    const openClawPath = join(openClawRoot, 'agents.json');
    if (await exists(openClawPath)) {
      return openClawPath;
    }
  }
  
  // Priority 3: Data root fallback
  return join(getDataRoot(), 'agents.json');
};

export const cronsFileAuto = async (): Promise<string> => {
  if (process.env.OPENCLAW_CRONS_PATH) {
    return process.env.OPENCLAW_CRONS_PATH;
  }
  
  const openClawRoot = getOpenClawRoot();
  if (openClawRoot) {
    const openClawPath = join(openClawRoot, 'crons.json');
    if (await exists(openClawPath)) {
      return openClawPath;
    }
  }
  
  return join(getDataRoot(), 'crons.json');
};

export const botsDirAuto = async (): Promise<string> => {
  if (process.env.OPENCLAW_BOTS_PATH) {
    return process.env.OPENCLAW_BOTS_PATH;
  }
  
  const openClawRoot = getOpenClawRoot();
  if (openClawRoot) {
    const openClawPath = join(openClawRoot, 'bots');
    if (await exists(openClawPath)) {
      return openClawPath;
    }
  }
  
  // NOTE: botsDirAuto returns the directory path, not individual files
  return join(getDataRoot(), 'bots');
};

// Get all bot directories for real bot data
export const getBotDirectories = async (): Promise<string[]> => {
  // Priority 1: OPENCLAW_BOTS_DIRS override - semicolon-separated list
  if (process.env.OPENCLAW_BOTS_DIRS) {
    const dirs = process.env.OPENCLAW_BOTS_DIRS.split(';').map(d => d.trim()).filter(Boolean);
    const validDirs = [];
    for (const dir of dirs) {
      if (await exists(dir)) {
        validDirs.push(dir);
      }
    }
    return validDirs;
  }

  // Priority 2: OPENCLAW_WORKSPACE base
  const base = process.env.OPENCLAW_WORKSPACE || getOpenClawRoot() || join(homedir(), '.openclaw', 'workspace');

  const directories = [
    join(base, "polymarket", "bots"),
    join(base, "trading", "options", "bots"),
    join(base, "trading", "futures", "bots")
  ];

  // Return only directories that exist
  const existing = [];
  for (const dir of directories) {
    if (await exists(dir)) {
      existing.push(dir);
    }
  }
  
  return existing;
};

// Legacy paths for reference (using new auto-detection)
export const agentsFile = () => join(getDataRoot(), 'agents.json');
export const cronsFile = () => join(getDataRoot(), 'crons.json');
export const botsDir = () => join(getDataRoot(), 'bots');
export const costsFile = () => join(getDataRoot(), 'costs.json');