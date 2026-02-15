import { Router } from 'express';
import { 
  getDataRoot, 
  getOpenClawRoot, 
  agentsFileAuto, 
  cronsFileAuto, 
  getBotDirectories,
  costsFile 
} from '../utils/paths.js';

export const sourcesRouter = Router();

sourcesRouter.get('/', async (req, res) => {
  const dataRoot = getDataRoot();
  const openClawRoot = getOpenClawRoot();
  
  const [
    agentsPath,
    cronsPath, 
    botDirectories
  ] = await Promise.all([
    agentsFileAuto(),
    cronsFileAuto(),
    getBotDirectories()
  ]);

  res.json({
    ok: true,
    dataRoot,
    openClawRoot,
    agentsPath,
    cronsPath,
    botsPath: botDirectories.join('; '),
    costsPath: costsFile()
  });
});