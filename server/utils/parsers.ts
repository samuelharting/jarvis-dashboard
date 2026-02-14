import { readFile } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { AgentStatus, CronJobStatus, BotStats } from '../../shared/types.js';

export const readJsonFile = async <T = any>(filePath: string): Promise<T | null> => {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
};

export const listJsonFiles = async (dirPath: string): Promise<string[]> => {
  try {
    const files = await readdir(dirPath);
    return files.filter(file => file.endsWith('.json'));
  } catch {
    return [];
  }
};

export const normalizeAgent = (raw: any): AgentStatus | null => {
  try {
    if (!raw) return null;

    // Handle both raw shapes
    const id = raw.id || raw.agentId;
    const name = raw.name || raw.agentName;
    const state = raw.state || raw.status;
    const lastSeen = raw.lastSeen || raw.lastHeartbeat;
    const summary = raw.summary || raw.note;

    if (typeof id !== 'string' || typeof name !== 'string') {
      return null;
    }

    // Normalize state
    let normalizedState: AgentStatus['state'] = 'unknown';
    const stateStr = (state || '').toString().toLowerCase();
    
    if (stateStr === 'running' || stateStr === 'active') {
      normalizedState = 'running';
    } else if (stateStr === 'idle') {
      normalizedState = 'idle';
    } else if (stateStr === 'error' || stateStr === 'failed') {
      normalizedState = 'error';
    }

    // Parse lastSeen
    let parsedLastSeen: string | null = null;
    if (lastSeen) {
      const date = new Date(lastSeen);
      if (!isNaN(date.getTime())) {
        parsedLastSeen = date.toISOString();
      }
    }

    return {
      id,
      name,
      state: normalizedState,
      lastSeen: parsedLastSeen,
      summary: typeof summary === 'string' ? summary : null
    };
  } catch {
    return null;
  }
};

export const normalizeCron = (raw: any): CronJobStatus | null => {
  try {
    if (!raw) return null;

    const id = raw.id || raw.name;
    const schedule = raw.schedule || raw.cron;
    const lastRun = raw.lastRun || raw.lastRunAt;
    const lastResult = raw.lastResult || raw.ok;
    const note = raw.note || raw.message;

    if (typeof id !== 'string') {
      return null;
    }

    // Normalize lastResult
    let normalizedLastResult: CronJobStatus['lastResult'] = 'unknown';
    if (typeof lastResult === 'boolean') {
      normalizedLastResult = lastResult ? 'success' : 'fail';
    } else if (typeof lastResult === 'string') {
      const resultStr = lastResult.toLowerCase();
      if (resultStr === 'success') normalizedLastResult = 'success';
      else if (resultStr === 'fail') normalizedLastResult = 'fail';
    }

    // Parse lastRun
    let parsedLastRun: string | null = null;
    if (lastRun) {
      const date = new Date(lastRun);
      if (!isNaN(date.getTime())) {
        parsedLastRun = date.toISOString();
      }
    }

    return {
      id,
      schedule: typeof schedule === 'string' ? schedule : null,
      lastRun: parsedLastRun,
      lastResult: normalizedLastResult,
      note: typeof note === 'string' ? note : null
    };
  } catch {
    return null;
  }
};

export const normalizeBot = (raw: any): BotStats | null => {
  try {
    if (!raw) return null;

    const id = raw.id || raw.botId;
    const name = raw.name || raw.botName;
    const pnl = raw.pnl || raw.totalPnl;
    const trades = raw.trades || raw.totalTrades;
    let winRate = raw.winRate || raw.winRatePct;

    if (typeof id !== 'string' || typeof name !== 'string') {
      return null;
    }

    if (typeof pnl !== 'number' || typeof trades !== 'number') {
      return null;
    }

    //normalize win rate
    if (typeof winRate === 'number') {
      // If provided as percentage (0-100), convert to 0-1
      if (winRate > 1 && winRate <= 100) {
        winRate = winRate / 100;
      }
      // Ensure bounds
      winRate = Math.max(0, Math.min(1, winRate));
    } else {
      winRate = null;
    }

    return {
      id,
      name,
      pnl,
      trades,
      winRate
    };
  } catch {
    return null;
  }
};

export const readBotStatsFromDir = async (dirPath: string) => {
  try {
    const botFiles = await listJsonFiles(dirPath);
    const bots: BotStats[] = [];
    
    for (const file of botFiles) {
      const filePath = join(dirPath, file);
      const data = await readJsonFile(filePath);
      
      const normalizedBot = normalizeBot(data);
      if (normalizedBot) {
        bots.push(normalizedBot);
      }
    }
    
    return bots;
  } catch {
    return [];
  }
};