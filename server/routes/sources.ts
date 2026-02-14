import { Router } from 'express';
import { 
  getDataRoot, 
  getOpenClawRoot, 
  agentsFileAuto, 
  cronsFileAuto, 
  botsDirAuto, 
  costsFile 
} from '../utils/paths.js';

export const sourcesRouter = Router();

sourcesRouter.get('/', async (req, res) => {
  const dataRoot = getDataRoot();
  const openClawRoot = getOpenClawRoot();
  
  const [
    agentsPath,
    cronsPath, 
    botsPath
  ] = await Promise.all([
    agentsFileAuto(),
    cronsFileAuto(),
    botsDirAuto()
  ]);

  res.json({
    ok: true,
    dataRoot,
    openClawRoot,
    agentsPath,
    cronsPath,
    botsPath,
    costsPath: costsFile()
  });
});