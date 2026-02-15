import { readFile } from 'fs/promises';
import { readdir, stat } from 'fs/promises';
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

export interface BotStatsWithHeartbeat extends BotStats {
  lastHeartbeatUtc?: string;
  heartbeatStatus?: 'green' | 'yellow' | 'red' | 'gray';
  fleet?: string;
  mode?: string;
  status?: string;
}

export const normalizeBot = (raw: any): BotStatsWithHeartbeat | null => {
  try {
    if (!raw) return null;

    const id = raw.bot_name || raw.id || raw.botId;
    const name = raw.bot_name || raw.name || raw.botName;
    const pnl = typeof raw.paper_pnl === 'number' ? raw.paper_pnl : raw.pnl || 0;
    const dailyPnl = typeof raw.daily_pnl === 'number' ? raw.daily_pnl : 0;
    const trades = typeof raw.paper_trades === 'number' ? raw.paper_trades : raw.trades || 0;
    let winRate = raw.win_rate || raw.winRate || raw.winRatePct;
    
    if (typeof id !== 'string' || typeof name !== 'string') {
      return null;
    }

    // Calculate heartbeat status
    const lastHeartbeatUtc = raw.last_heartbeat_utc || raw.lastHeartbeatUtc;
    let heartbeatStatus: 'green' | 'yellow' | 'red' | 'gray' = 'gray';
    
    if (lastHeartbeatUtc) {
      const lastHeartbeat = new Date(lastHeartbeatUtc);
      const now = new Date();
      const minutesDiff = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60);
      
      if (minutesDiff < 5) {
        heartbeatStatus = 'green';
      } else if (minutesDiff < 30) {
        heartbeatStatus = 'yellow';
      } else {
        heartbeatStatus = 'red';
      }
    }

    // Ensure numeric values
    const numPnl = typeof pnl === 'number' ? pnl : parseFloat(pnl) || 0;
    const numDailyPnl = typeof dailyPnl === 'number' ? dailyPnl : parseFloat(dailyPnl) || 0;
    const numTrades = typeof trades === 'number' ? trades : parseInt(trades) || 0;

    // Normalize win rate
    if (typeof winRate === 'number') {
      if (winRate > 1 && winRate <= 100) {
        winRate = winRate / 100;
      }
      winRate = Math.max(0, Math.min(1, winRate));
    } else {
      winRate = null;
    }

    return {
      id,
      name,
      pnl: numPnl,
      dailyPnl: numDailyPnl,
      trades: numTrades,
      winRate,
      lastHeartbeatUtc,
      heartbeatStatus,
      fleet: raw.fleet,
      mode: raw.mode,
      status: raw.status
    };
  } catch {
    return null;
  }
};

export const readBotStatsFromAllDirs = async (dirPaths: string[]): Promise<BotStats[]> => {
  const allBots: BotStats[] = [];

  for (const dirPath of dirPaths) {
    try {
      const files = await readdir(dirPath, { withFileTypes: true });
      
      // Each file in the bots directory is a bot subdirectory
      for (const entry of files) {
        if (!entry.isDirectory()) continue;
        
        // Skip _killed folders
        if (entry.name.startsWith('_killed')) continue;
        
        const botDirPath = join(dirPath, entry.name);
        const statsPath = join(botDirPath, 'stats.json');
        
        // Read stats.json directly instead of scanning all JSON files
        const data = await readJsonFile(statsPath);
        
        const normalizedBot = normalizeBot(data);
        if (normalizedBot) {
          allBots.push(normalizedBot);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read, skip it
      continue;
    }
  }

  return allBots;
};

// Legacy function for single directory
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