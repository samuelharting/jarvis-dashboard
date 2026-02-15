import express from 'express';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { exists } from '../utils/paths.js';

const router = express.Router();

// Helper to get trading directory path
const getTradingDir = (): string => {
  // Priority 1: Environment override
  if (process.env.OPENCLAW_TRADING_PATH) {
    return process.env.OPENCLAW_TRADING_PATH;
  }
  
  // Priority 2: OpenClaw workspace (OPENCLAW_WORKSPACE or OPENCLAW_ROOT)
  const workspaceRoot = process.env.OPENCLAW_WORKSPACE || process.env.OPENCLAW_ROOT;
  if (workspaceRoot) {
    return join(workspaceRoot, 'trading');
  }
  
  // Priority 3: Default relative to project
  return join(process.cwd(), '..', '..', 'trading');
};

// GET /api/trading/scoreboard
router.get('/scoreboard', async (req, res) => {
  try {
    const tradingDir = getTradingDir();
    const scoreboardPath = join(tradingDir, 'scoreboard.json');
    
    if (!await exists(scoreboardPath)) {
      return res.status(404).json({ 
        ok: false, 
        error: 'scoreboard_not_found',
        message: `Scoreboard file not found at ${scoreboardPath}` 
      });
    }
    
    const data = await readFile(scoreboardPath, 'utf-8');
    const scoreboard = JSON.parse(data);
    
    // Validate schema version
    if (scoreboard.schema_version !== 1) {
      return res.status(500).json({ 
        ok: false, 
        error: 'unsupported_schema_version', 
        version: scoreboard.schema_version,
        message: 'Expected schema_version: 1' 
      });
    }
    
    res.json({ 
      ok: true, 
      data: scoreboard,
      generated_at: scoreboard.generated_at,
      path: scoreboardPath 
    });
  } catch (error: any) {
    console.error('Error loading scoreboard:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'server_error',
      message: error.message 
    });
  }
});

// GET /api/trading/pending
router.get('/pending', async (req, res) => {
  try {
    const tradingDir = getTradingDir();
    const pendingPath = join(tradingDir, 'pending.json');
    
    if (!await exists(pendingPath)) {
      return res.json({
        ok: true,
        data: null,
        errors: [{
          endpoint: '/api/trading/pending',
          message: 'Pending trades file not found',
          code: 'pending_not_found',
          path: pendingPath
        }]
      });
    }
    
    const data = await readFile(pendingPath, 'utf-8');
    const pending = JSON.parse(data);
    
    // Validate schema version
    if (pending.schema_version !== 1) {
      return res.json({
        ok: true,
        data: null,
        errors: [{
          endpoint: '/api/trading/pending',
          message: 'Unsupported schema version',
          code: 'unsupported_schema_version',
          expected: 1,
          actual: pending.schema_version
        }]
      });
    }
    
    res.json({ 
      ok: true, 
      data: pending,
      errors: []
    });
  } catch (error: any) {
    console.error('Error loading pending trades:', error);
    res.json({
      ok: true,
      data: null,
      errors: [{
        endpoint: '/api/trading/pending',
        message: error.message,
        code: 'server_error'
      }]
    });
  }
});

// GET /api/trading/status (combined endpoint with graceful empty state)
router.get('/status', async (req, res) => {
  try {
    const tradingDir = getTradingDir();
    const scoreboardPath = join(tradingDir, 'scoreboard.json');
    const pendingPath = join(tradingDir, 'pending.json');
    
    const [scoreboardExists, pendingExists] = await Promise.all([
      exists(scoreboardPath),
      exists(pendingPath)
    ]);
    
    const errors = [];
    let scoreboard = null;
    let pending = null;
    
    // Load scoreboard with error handling
    if (scoreboardExists) {
      try {
        const scoreboardData = await readFile(scoreboardPath, 'utf-8');
        const parsedScoreboard = JSON.parse(scoreboardData);
        if (parsedScoreboard.schema_version === 1) {
          scoreboard = parsedScoreboard;
        } else {
          errors.push({
            endpoint: '/api/trading/scoreboard',
            message: 'Unsupported schema version',
            code: 'unsupported_schema_version',
            expected: 1,
            actual: parsedScoreboard.schema_version,
            path: scoreboardPath
          });
        }
      } catch (error: any) {
        errors.push({
          endpoint: '/api/trading/scoreboard',
          message: `Error loading: ${error.message}`,
          code: 'load_error',
          path: scoreboardPath
        });
      }
    } else {
      errors.push({
        endpoint: '/api/trading/scoreboard',
        message: 'Scoreboard file not found',
        code: 'scoreboard_not_found',
        path: scoreboardPath
      });
    }
    
    // Load pending with error handling
    if (pendingExists) {
      try {
        const pendingData = await readFile(pendingPath, 'utf-8');
        const parsedPending = JSON.parse(pendingData);
        if (parsedPending.schema_version === 1) {
          pending = parsedPending;
        } else {
          errors.push({
            endpoint: '/api/trading/pending',
            message: 'Unsupported schema version',
            code: 'unsupported_schema_version',
            expected: 1,
            actual: parsedPending.schema_version,
            path: pendingPath
          });
        }
      } catch (error: any) {
        errors.push({
          endpoint: '/api/trading/pending',
          message: `Error loading: ${error.message}`,
          code: 'load_error',
          path: pendingPath
        });
      }
    } else {
      errors.push({
        endpoint: '/api/trading/pending',
        message: 'Pending trades file not found',
        code: 'pending_not_found',
        path: pendingPath
      });
    }
    
    res.json({
      ok: true,
      data: {
        scoreboard,
        pending,
        has_data: scoreboard !== null || pending !== null
      },
      errors,
      generated_at: new Date().toISOString(),
      paths: {
        scoreboard: scoreboardPath,
        pending: pendingPath
      }
    });
  } catch (error: any) {
    console.error('Error loading trading status:', error);
    res.json({
      ok: true,
      data: null,
      errors: [{
        endpoint: '/api/trading/status',
        message: error.message,
        code: 'server_error'
      }],
      generated_at: new Date().toISOString()
    });
  }
});

// POST /api/trading/proposals/:id/approve
router.post('/proposals/:id/approve', async (req, res) => {
  try {
    const proposalId = req.params.id;
    const tradingDir = getTradingDir();
    const scoreboardPath = join(tradingDir, 'scoreboard.json');
    const auditPath = join(tradingDir, 'audit.jsonl');
    
    if (!await exists(scoreboardPath)) {
      return res.status(404).json({
        ok: false,
        error: 'scoreboard_not_found',
        message: 'Cannot approve proposal without scoreboard'
      });
    }
    
    const data = await readFile(scoreboardPath, 'utf-8');
    const scoreboard = JSON.parse(data);
    
    // Find the proposal
    const proposalIndex = scoreboard.kill_proposals?.findIndex((p: any) => 
      p.bot_name === proposalId || p.proposal_id === proposalId
    );
    
    if (proposalIndex === -1 || proposalIndex === undefined) {
      return res.status(404).json({
        ok: false,
        error: 'proposal_not_found',
        proposal_id: proposalId,
        message: 'Proposal not found in scoreboard'
      });
    }
    
    const proposal = scoreboard.kill_proposals[proposalIndex];
    
    // Update proposal status
    proposal.status = 'approved';
    proposal.approved_at = new Date().toISOString();
    proposal.approved_by = 'dashboard'; // In real implementation, would be user
    
    // Write audit log
    const auditEntry = {
      action: 'proposal_approved',
      proposal_id: proposalId,
      bot_name: proposal.bot_name,
      reason: proposal.reason,
      approved_at: proposal.approved_at,
      approved_by: proposal.approved_by,
      timestamp: new Date().toISOString()
    };
    
    await writeFile(auditPath, JSON.stringify(auditEntry) + '\n', { flag: 'a' });
    
    // Update scoreboard
    await writeFile(scoreboardPath, JSON.stringify(scoreboard, null, 2));
    
    res.json({
      ok: true,
      data: {
        proposal: proposal,
        message: `Proposal ${proposalId} approved. Bot ${proposal.bot_name} should be terminated.`
      }
    });
  } catch (error: any) {
    console.error('Error approving proposal:', error);
    res.status(500).json({
      ok: false,
      error: 'server_error',
      message: error.message
    });
  }
});

// POST /api/trading/proposals/:id/reject
router.post('/proposals/:id/reject', async (req, res) => {
  try {
    const proposalId = req.params.id;
    const tradingDir = getTradingDir();
    const scoreboardPath = join(tradingDir, 'scoreboard.json');
    const auditPath = join(tradingDir, 'audit.jsonl');
    
    if (!await exists(scoreboardPath)) {
      return res.status(404).json({
        ok: false,
        error: 'scoreboard_not_found',
        message: 'Cannot reject proposal without scoreboard'
      });
    }
    
    const data = await readFile(scoreboardPath, 'utf-8');
    const scoreboard = JSON.parse(data);
    
    // Find the proposal
    const proposalIndex = scoreboard.kill_proposals?.findIndex((p: any) => 
      p.bot_name === proposalId || p.proposal_id === proposalId
    );
    
    if (proposalIndex === -1 || proposalIndex === undefined) {
      return res.status(404).json({
        ok: false,
        error: 'proposal_not_found',
        proposal_id: proposalId,
        message: 'Proposal not found in scoreboard'
      });
    }
    
    const proposal = scoreboard.kill_proposals[proposalIndex];
    
    // Update proposal status
    proposal.status = 'rejected';
    proposal.rejected_at = new Date().toISOString();
    proposal.rejected_by = 'dashboard'; // In real implementation, would be user
    proposal.rejection_reason = req.body.reason || 'No reason provided';
    
    // Write audit log
    const auditEntry = {
      action: 'proposal_rejected',
      proposal_id: proposalId,
      bot_name: proposal.bot_name,
      reason: proposal.reason,
      rejection_reason: proposal.rejection_reason,
      rejected_at: proposal.rejected_at,
      rejected_by: proposal.rejected_by,
      timestamp: new Date().toISOString()
    };
    
    await writeFile(auditPath, JSON.stringify(auditEntry) + '\n', { flag: 'a' });
    
    // Update scoreboard
    await writeFile(scoreboardPath, JSON.stringify(scoreboard, null, 2));
    
    res.json({
      ok: true,
      data: {
        proposal: proposal,
        message: `Proposal ${proposalId} rejected. Bot ${proposal.bot_name} will continue running.`
      }
    });
  } catch (error: any) {
    console.error('Error rejecting proposal:', error);
    res.status(500).json({
      ok: false,
      error: 'server_error',
      message: error.message
    });
  }
});

export default router;