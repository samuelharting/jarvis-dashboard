import express from 'express';
import { botsDirAuto } from '../utils/paths.js';
import { readBotStatsFromDir } from '../utils/parsers.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const botsDir = await botsDirAuto();
    const bots = await readBotStatsFromDir(botsDir);
    
    const bot = bots.find(b => b.id === req.params.id);
    
    if (!bot) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }
    
    res.json({ ok: true, data: bot });
  } catch (error) {
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

export default router;