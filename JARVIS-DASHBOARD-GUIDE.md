# Jarvis Dashboard – Complete Layout & Integration Guide

This document describes the **Jarvis Dashboard** so Jarvis (the AI) can understand every section, data source, and API, and integrate fully (e.g. populate Ideas, Work Tracker, and use the same data the dashboard uses).

---

## 1. High-Level Layout

- **Frontend:** React + Vite, dark theme, single-page app. **Port 5174** → open **http://localhost:5174/** in the browser.
- **Backend:** Express server on **port 3031** → **http://127.0.0.1:3031**; API base: `http://127.0.0.1:3031/api`.
- **Navigation:** Left **Sidebar** only (no top navbar in the main layout). All sections are reached via sidebar links.
- **Ports to avoid (other projects):** Do not use 3030, 5173, or 18789 — those are used by another CRM and by Jarvis chat.

**Sidebar sections (in order):**

| Section       | Label         | Route         | Purpose |
|--------------|---------------|---------------|---------|
| System       | Overview      | `/overview`   | System summary, counts, warnings, daily costs |
| Trading Fleets | Bots        | `/bots`       | Trading bot fleet: P&L, trades, heartbeats |
| Trading Fleets | Trading     | `/trading`    | Scoreboard, pending trades, kill proposals |
| Monitoring   | Agents        | `/agents`     | AI agent list and status |
| Monitoring   | Cron Jobs     | `/cron`       | Scheduled jobs and last run/result |
| **Jarvis**   | **Ideas**     | `/ideas`      | Ideas Jarvis wants to add/change (currently mock data) |
| **Jarvis**   | **Work Tracker** | `/work-tracker` | What Jarvis is working on / done (currently mock data) |

Default route: `/` redirects to `/overview`.

---

## 2. Section-by-Section (What Jarvis Needs to Know)

### 2.1 Overview (`/overview`)

- **What it shows:**  
  - Counts: total bots, agents, cron jobs.  
  - Daily costs (USD).  
  - Server time.  
  - System warnings (e.g. missing/invalid data).  
  - Quick links to Bots, Trading, Agents, Cron.
- **Data source:** Single API: `GET /api/overview`.  
  - Response includes: `bots[]`, `agents[]`, `crons[]`, `warnings[]`, `costsTodayUsd`, `serverTime`.
- **Refresh:** Every 30 seconds.
- **Jarvis integration:**  
  - To influence “system health” and warnings, ensure the files the server reads (agents, crons, bots, costs) are correct.  
  - No dedicated “Jarvis message” field here; use Ideas or Work Tracker for that.

---

### 2.2 Bots (`/bots`)

- **What it shows:**  
  - One card per bot: name, fleet, mode, status, heartbeat (green/yellow/red).  
  - Total P&L, daily P&L, trades, win rate.  
  - Last heartbeat time.  
  - Text filter by name, fleet, or status.
- **Data source:** Same as Overview: `GET /api/overview` → `response.bots`.  
  - Each bot: `id`, `name`, `pnl`, `dailyPnl`, `trades`, `winRate`, `lastHeartbeatUtc`, `heartbeatStatus`, `fleet`, `mode`, `status`.
- **Backend:** Server also exposes `GET /api/bots` (list) and `GET /api/bots/:id` (one bot).  
  - Bot list is built by scanning **bot directories** (see “Data locations” below).
- **Jarvis integration:**  
  - Bots come from files in those directories; Jarvis cannot edit them from the dashboard.  
  - Jarvis can use this page to “see” fleet state and refer to it in Ideas/Work Tracker or in conversation.

---

### 2.3 Trading (`/trading`)

- **What it shows:** Three tabs.  
  - **Scoreboard:** Bot name, score, real_trades, paper_pnl, status, staleness.  
  - **Pending:** Pending trades (bot, question, side, edge %, expected PnL).  
  - **Kill proposals:** Proposals to kill a bot; user can **Approve** or **Reject**.
- **Data sources:**  
  - Scoreboard + kill proposals: `GET /api/trading/scoreboard` → reads `{trading_dir}/scoreboard.json` (must have `schema_version: 1`).  
  - Pending: `GET /api/trading/pending` → reads `{trading_dir}/pending.json` (schema_version: 1).
- **Actions (Jarvis-relevant):**  
  - `POST /api/trading/proposals/:id/approve` – approve kill proposal.  
  - `POST /api/trading/proposals/:id/reject` – reject (optional body: `{ "reason": "..." }`).  
  - Approve/reject updates `scoreboard.json` and appends to `audit.jsonl`.
- **Trading directory:**  
  - `OPENCLAW_TRADING_PATH` **or** `{OPENCLAW_WORKSPACE or OPENCLAW_ROOT}/trading` **or** default `../../trading` from server.
- **Jarvis integration:**  
  - If Jarvis produces `scoreboard.json` / `pending.json` / kill proposals, the dashboard will show them.  
  - Jarvis can be instructed to call the approve/reject APIs (e.g. via a script or tool that uses the dashboard’s API base).

---

### 2.4 Agents (`/agents`)

- **What it shows:**  
  - Summary counts: total, running, idle, error.  
  - List of agents: name, state (running/idle/error/unknown), last seen, summary.  
  - Text filter by name, state, or summary.
- **Data source:** `GET /api/overview` → `response.agents`.  
  - Each agent: `id`, `name`, `state`, `lastSeen`, `summary`.
- **Backend:** Agents come from a single **agents JSON file** (see “Data locations”).  
  - No agents-specific API; overview aggregates it.
- **Jarvis integration:**  
  - If Jarvis (or another process) writes/updates the agents file, the dashboard will reflect it.  
  - Jarvis can describe “what agents are doing” in Ideas or Work Tracker using this data.

---

### 2.5 Cron (`/cron`)

- **What it shows:**  
  - Table: Job name (id), schedule, last run, status (success/fail/unknown), note.  
  - Text filter by id or note.
- **Data source:** `GET /api/overview` → `response.crons`.  
  - Each cron: `id`, `schedule`, `lastRun`, `lastResult`, `note`.
- **Backend:** Single **crons JSON file** (array of jobs).
- **Jarvis integration:**  
  - Cron data is read-only from the dashboard.  
  - Jarvis can refer to cron state in Ideas/Work Tracker; to “add” a cron, the crons file must be updated elsewhere.

---

### 2.6 Ideas (`/ideas`) – **For Jarvis to populate**

- **What it shows:**  
  - List of “ideas” (title, description, priority, category, createdAt).  
  - Priority: high / medium / low.  
  - Currently **mock data only** in the React component (`src/components/Ideas/Ideas.tsx`).
- **Data source:** None yet. All data is hardcoded in the frontend.
- **Jarvis integration (intended):**  
  - Add an API (e.g. `GET /api/jarvis/ideas`) that returns a JSON array of ideas.  
  - Or use a file (e.g. `data/jarvis-ideas.json` or under OpenClaw workspace) that the server reads and the dashboard fetches.  
  - Idea shape: `id`, `title`, `description`, `priority` ('high'|'medium'|'low'), `category`, `createdAt` (ISO string).  
  - Jarvis can then append new ideas to that file/API so the dashboard shows “what Jarvis wants to add/change.”

---

### 2.7 Work Tracker (`/work-tracker`) – **For Jarvis to populate**

- **What it shows:**  
  - **Currently working on:** items with status `in-progress` (with optional progress bar).  
  - **Up next:** status `todo`.  
  - **Recently completed:** status `completed` (with completed date, actual vs estimated hours).  
  - Each item: title, description, status, startedAt, completedAt, estimatedHours, actualHours.
- **Data source:** None yet. All data is hardcoded in the frontend (`src/components/WorkTracker/WorkTracker.tsx`).
- **Jarvis integration (intended):**  
  - Add an API (e.g. `GET /api/jarvis/work`) or a file (e.g. `data/jarvis-work.json`) that the server reads and the dashboard fetches.  
  - Work item shape: `id`, `title`, `description`, `status` ('in-progress'|'completed'|'todo'), `startedAt`, `completedAt`, `estimatedHours`, `actualHours`.  
  - Jarvis can update this when starting a task, finishing it, or adding a todo so the dashboard shows “what Jarvis is doing / has done.”

---

## 3. API Summary (for scripts / Jarvis tools)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health + serverTime |
| GET | `/api/overview` | Bots, agents, crons, warnings, costsTodayUsd, serverTime |
| GET | `/api/sources` | Paths: dataRoot, agentsPath, cronsPath, botsPath, costsPath |
| GET | `/api/bots` | List all bots |
| GET | `/api/bots/:id` | One bot by id |
| GET | `/api/trading/scoreboard` | Scoreboard + kill_proposals (from scoreboard.json) |
| GET | `/api/trading/pending` | Pending trades (from pending.json) |
| GET | `/api/trading/status` | Combined scoreboard + pending + paths |
| POST | `/api/trading/proposals/:id/approve` | Approve kill proposal |
| POST | `/api/trading/proposals/:id/reject` | Reject kill proposal (body: `{ "reason": "..." }` optional) |

Base URL: `http://127.0.0.1:3031` (backend). Frontend: `http://localhost:5174`.

---

## 4. Data Locations (where the server reads/writes)

- **Data root:**  
  - `JARVIS_DATA_ROOT` (absolute or relative to project) **or** default `{project_root}/data`.
- **OpenClaw root:**  
  - `OPENCLAW_ROOT` (optional); used for agents, crons, bots dirs and trading if workspace not set.
- **Agents:**  
  - `OPENCLAW_AGENTS_PATH` **or** `{OPENCLAW_ROOT}/agents.json` **or** `{dataRoot}/agents.json`.
- **Crons:**  
  - `OPENCLAW_CRONS_PATH` **or** `{OPENCLAW_ROOT}/crons.json` **or** `{dataRoot}/crons.json`.
- **Bots:**  
  - List of dirs from `OPENCLAW_BOTS_DIRS` (semicolon-separated) **or** auto:  
    `{OPENCLAW_WORKSPACE or OPENCLAW_ROOT or ~/.openclaw/workspace}/polymarket/bots`,  
    `.../trading/options/bots`,  
    `.../trading/futures/bots`.
- **Costs:**  
  - Always `{dataRoot}/costs.json`; dashboard expects `costsTodayUsd` (number).
- **Trading:**  
  - Dir: `OPENCLAW_TRADING_PATH` **or** `{OPENCLAW_WORKSPACE or OPENCLAW_ROOT}/trading` **or** `../../trading`.  
  - Files: `scoreboard.json`, `pending.json`, `audit.jsonl` (written on approve/reject).

Ideas and Work Tracker do **not** have file/API locations yet; adding them is the next step for full Jarvis integration.

---

## 5. File Structure (relevant to Jarvis)

```
jarvis-dashboard/
├── src/
│   ├── App.tsx                    # Routes: overview, bots, agents, cron, trading, ideas, work-tracker
│   ├── lib/api.ts                 # All API calls (overview, trading, sources, health)
│   ├── pages/
│   │   ├── Overview.tsx
│   │   ├── Bots.tsx
│   │   ├── Agents.tsx
│   │   ├── Cron.tsx
│   │   └── Trading.tsx
│   └── components/
│       ├── AppLayout.tsx          # Uses Sidebar + Outlet (main content)
│       ├── Sidebar/Sidebar.tsx     # Navigation (only nav UI used)
│       ├── Ideas/Ideas.tsx         # Ideas page (mock data)
│       └── WorkTracker/WorkTracker.tsx  # Work tracker page (mock data)
├── server/
│   ├── index.ts                   # Express app, port 3031, CORS for client
│   ├── routes/
│   │   ├── health.ts
│   │   ├── overview.ts            # Reads agents, crons, bots, costs
│   │   ├── sources.ts
│   │   ├── bots.ts
│   │   └── trading.ts             # scoreboard, pending, approve/reject
│   └── utils/
│       ├── paths.ts               # Data root, OpenClaw, agents/crons/bots/costs paths
│       └── parsers.ts             # Read and normalize agents, crons, bot stats
├── shared/
│   └── types.ts                   # AgentStatus, CronJobStatus, BotStats, OverviewResponse
└── JARVIS-DASHBOARD-GUIDE.md      # This file
```

---

## 6. How to Fully Integrate Jarvis

1. **Use existing sections**  
   - Overview, Bots, Agents, Cron: Jarvis can reason over the same data the dashboard shows by calling `GET /api/overview` (and optionally `/api/sources` for paths).  
   - Trading: Jarvis can read scoreboard/pending via API and perform approve/reject via POST.

2. **Ideas**  
   - Introduce a store for “Jarvis ideas” (file or DB) and an API, e.g. `GET /api/jarvis/ideas`.  
   - Update the Ideas page to fetch from that API instead of mock data.  
   - Have Jarvis (or a script it triggers) add/update ideas in that store so the dashboard reflects “what Jarvis wants to add/change.”

3. **Work Tracker**  
   - Introduce a store for “Jarvis work items” (file or DB) and an API, e.g. `GET /api/jarvis/work` (and optionally PATCH/POST to update).  
   - Update the Work Tracker page to fetch from that API instead of mock data.  
   - Have Jarvis update work items when it starts a task, completes it, or adds a todo so the dashboard shows “what Jarvis is doing / has done.”

4. **CORS**  
   - Server allows origin `http://localhost:5174` (Vite dev server for this dashboard). Do not use 5173 — that’s another project.

5. **Single place for “what Jarvis should know”**  
   - Share this guide with Jarvis so it knows:  
     - All sidebar sections and routes,  
     - Which data is read from which API/file,  
     - Which actions (e.g. trading approve/reject) exist,  
     - That Ideas and Work Tracker are meant to be populated by Jarvis once their backend/APIs exist.

---

## 7. Quick reference – Routes and data

| Route | Page | Data from | Writable by API? |
|-------|------|-----------|------------------|
| `/overview` | Overview | GET /api/overview | No (derived from files) |
| `/bots` | Bots | GET /api/overview → bots | No |
| `/agents` | Agents | GET /api/overview → agents | No (file-based) |
| `/cron` | Cron | GET /api/overview → crons | No (file-based) |
| `/trading` | Trading | GET /api/trading/scoreboard, /pending; POST approve/reject | Yes (scoreboard + audit) |
| `/ideas` | Ideas | **Mock only** | Not yet |
| `/work-tracker` | Work Tracker | **Mock only** | Not yet |

Use this document to ask Jarvis to integrate with the dashboard (e.g. “Use the paths in JARVIS-DASHBOARD-GUIDE.md to write ideas” or “When you finish a task, update the work tracker API described in the guide”).
