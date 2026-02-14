# Jarvis Dashboard

A real-time dashboard for monitoring Jarvis/OpenClaw systems with Vite React frontend and Express TypeScript backend.

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install

# Run both frontend and backend concurrently
npm run dev
```

Visit http://localhost:5173 to view the dashboard.

## Environment Variables

Copy `.env.example` to `.env` and adjust paths:

### Core Variables
- `JARVIS_DATA_ROOT` - Root directory for data files (default: `./data`)
- `OPENCLAW_ROOT` - OpenClaw project directory (optional)

### Override Variables
- `OPENCLAW_AGENTS_PATH` - Override agents.json location
- `OPENCLAW_CRONS_PATH` - Override crons.json location  
- `OPENCLAW_BOTS_PATH` - Override bots directory location

## Windows PowerShell Examples

```powershell
# Basic usage (uses ./data folder)
npm run dev

# Custom data folder
$env:JARVIS_DATA_ROOT="C:\Users\John\jarvis-data"
npm run dev

# Using OpenClaw project
$env:OPENCLAW_ROOT="C:\Users\John\openclaw-project"
npm run dev

# Custom individual paths
$env:OPENCLAW_ROOT="C:\OpenClaw"
$env:OPENCLAW_AGENTS_PATH="C:\OpenClaw\current\agents.json"
$env:OPENCLAW_BOTS_PATH="C:\OpenClaw\strategies"
npm run dev
```

## Data Source Priority

The dashboard automatically detects data sources in this order:

1. **Environment path overrides** (if set)
2. **OpenClaw directory** (if exists and $OPENCLAW_ROOT set)
3. **Fallback to ./data** directory

### File Structure

**OpenClaw Project Structure:**
```
openclaw/
├── agents.json
├── crons.json
├── bots/
│   ├── *.json
```

**Data Directory Structure:**
```
data/
├── agents.json
├── crons.json
├── costs.json
└── bots/
    ├── *.json
```

## File Formats

### agents.json
```json
[
  {
    "id": "agent_name",
    "name": "Display Name",
    "state": "running|idle|error|unknown",
    "lastSeen": "2026-02-13T10:30:00.000Z",
    "summary": "Current status message"
  }
]
```

### crons.json
```json
[
  {
    "id": "job_name",
    "schedule": "0 * * * *",
    "lastRun": "2026-02-13T10:00:00.000Z",
    "lastResult": "success|fail|unknown",
    "note": "Optional description"
  }
]
```

### Bot Stats Files
```json
{
  "id": "bot_identifier",
  "name": "Friendly Name",
  "pnl": 123.45,
  "trades": 15,
  "winRate": 0.67
}
```