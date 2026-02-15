import { Router } from 'express';
import { OverviewResponse, AgentStatus, CronJobStatus } from '../../shared/types.js';
import { 
  agentsFileAuto, 
  cronsFileAuto, 
  botsDirAuto, 
  costsFile,
  getBotDirectories,
  getOpenClawRoot,
  getDataRoot,
  exists
} from '../utils/paths.js';
import { 
  readJsonFile, 
  readBotStatsFromDir,
  readBotStatsFromAllDirs,
  normalizeAgent,
  normalizeCron 
} from '../utils/parsers.js';

export const overviewRouter = Router();

overviewRouter.get('/', async (req, res) => {
  const warnings: string[] = [];
  const sources = {
    agents: '',
    crons: '',
    bots: '',
    costs: ''
  };
  
  // Agents
  const agentsPath = await agentsFileAuto();
  sources.agents = agentsPath;
  const agentsData = await readJsonFile(agentsPath);
  let agents: AgentStatus[] = [];
  
  if (Array.isArray(agentsData)) {
    agents = agentsData
      .map(normalizeAgent)
      .filter((a): a is AgentStatus => a !== null);
  }
  
  if (!Array.isArray(agentsData) || agents.length === 0) {
    warnings.push(`Agents source: ${agentsPath} (no valid data)`);
  } else {
    const invalid = agentsData.length - agents.length;
    if (invalid > 0) {
      warnings.push(`Agents source: ${agentsPath} (${invalid} invalid records skipped)`);
    }
  }
  
  // Cron jobs
  const cronsPath = await cronsFileAuto();
  sources.crons = cronsPath;
  const cronsData = await readJsonFile(cronsPath);
  let crons: CronJobStatus[] = [];
  
  if (Array.isArray(cronsData)) {
    crons = cronsData
      .map(normalizeCron)
      .filter((c): c is CronJobStatus => c !== null);
  }
  
  if (!Array.isArray(cronsData) || crons.length === 0) {
    warnings.push(`Crons source: ${cronsPath} (no valid data)`);
  } else {
    const invalid = cronsData.length - crons.length;
    if (invalid > 0) {
      warnings.push(`Crons source: ${cronsPath} (${invalid} invalid records skipped)`);
    }
  }
  
  // Bots
  const botDirectories = await getBotDirectories();
  sources.bots = botDirectories.join('; ');
  const bots = await readBotStatsFromAllDirs(botDirectories);
  
  if (bots.length === 0) {
    if (botDirectories.length === 0) {
      warnings.push('Bots source: No bot directories found in standard auto-detect locations');
    } else {
      warnings.push(`Bots source: Found ${botDirectories.length} bot directories but no valid bots`);
    }
  }
  
  // Costs (always from data root)
  const costsPath = costsFile();
  sources.costs = costsPath;
  const costsData = await readJsonFile(costsPath);
  const costsTodayUsd = costsData && typeof costsData === 'object' && 'costsTodayUsd' in costsData 
    ? costsData.costsTodayUsd as number 
    : null;
  
  if (!costsData) {
    warnings.push(`Costs source: ${costsPath} (missing)`);
  }

  // Add OpenClaw warnings
  const openClawRoot = getOpenClawRoot();
  if (openClawRoot && !await exists(openClawRoot)) {
    warnings.push(`OpenClaw root set but not found: ${openClawRoot}`);
  }

  const response: OverviewResponse = {
    ok: true,
    serverTime: new Date().toISOString(),
    warnings,
    agents,
    crons,
    bots,
    costsTodayUsd
  };
  
  res.json(response);
});