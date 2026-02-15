import express from 'express';
import { getBotDirectories } from '../utils/paths.js';
import { readBotStatsFromAllDirs } from '../utils/parsers.js';

const router = express.Router();

// GET /api/bots - return all bots (for verification: curl .../api/bots | grep -o "bot_name" | wc -l)
router.get('/', async (req, res) => {
  try {
    const botDirectories = await getBotDirectories();
    const bots = await readBotStatsFromAllDirs(botDirectories);
    res.json({ ok: true, bots, count: bots.length });
  } catch (error) {
    res.status(500).json({ ok: false, error: "server_error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const botDirectories = await getBotDirectories();
    const bots = await readBotStatsFromAllDirs(botDirectories);
    
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