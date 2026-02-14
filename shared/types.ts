export interface HealthResponse {
  ok: boolean;
  serverTime: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  state: "running" | "idle" | "error" | "unknown";
  lastSeen: string | null;
  summary: string | null;
}

export interface CronJobStatus {
  id: string;
  schedule: string | null;
  lastRun: string | null;
  lastResult: "success" | "fail" | "unknown";
  note: string | null;
}

export interface BotStats {
  id: string;
  name: string;
  pnl: number;
  trades: number;
  winRate: number | null;
}

export interface OverviewResponse {
  ok: true;
  serverTime: string;
  warnings: string[];
  agents: AgentStatus[];
  crons: CronJobStatus[];
  bots: BotStats[];
  costsTodayUsd: number | null;
}