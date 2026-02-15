import { HealthResponse, OverviewResponse } from '../../shared/types';

const API_BASE_URL = 'http://127.0.0.1:3031/api';

interface SourcesResponse {
  ok: true;
  dataRoot: string;
  openClawRoot: string | null;
  agentsPath: string;
  cronsPath: string;
  botsPath: string;
  costsPath: string;
}

// Trading API types
interface ScoreboardResponse {
  ok: boolean;
  data: {
    schema_version: number;
    tournament: string;
    generated_at: string;
    scoreboard: Array<{
      name: string;
      score: number;
      real_trades: number;
      paper_pnl: number;
      staleness_status: string;
      status: string;
      [key: string]: any;
    }>;
    kill_proposals: Array<{
      proposal_id: string;
      bot_name: string;
      reason: string;
      status: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

interface PendingResponse {
  ok: boolean;
  data: {
    schema_version: number;
    total_pending: number;
    pending_trades: Array<{
      trade_id: string;
      bot: string;
      market_id: string;
      question: string;
      side: string;
      entry_price: number;
      expected_edge_pct: number;
      expected_pnl: number;
      status: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

export const api = {
  health: {
    get: async (): Promise<HealthResponse> => {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      return response.json();
    }
  },
  overview: {
    getOverview: async (): Promise<OverviewResponse> => {
      const response = await fetch(`${API_BASE_URL}/overview`);
      if (!response.ok) {
        throw new Error('Failed to fetch overview data');
      }
      return response.json();
    }
  },
  sources: {
    getSources: async (): Promise<SourcesResponse> => {
      const response = await fetch(`${API_BASE_URL}/sources`);
      if (!response.ok) {
        throw new Error('Failed to fetch sources info');
      }
      return response.json();
    }
  },
  trading: {
    getScoreboard: async (): Promise<ScoreboardResponse> => {
      const response = await fetch(`${API_BASE_URL}/trading/scoreboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch scoreboard data');
      }
      return response.json();
    },
    getPending: async (): Promise<PendingResponse> => {
      const response = await fetch(`${API_BASE_URL}/trading/pending`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending trades data');
      }
      return response.json();
    },
    approveProposal: async (proposalId: string): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/trading/proposals/${proposalId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to approve proposal');
      }
      return response.json();
    },
    rejectProposal: async (proposalId: string, reason?: string): Promise<any> => {
      const response = await fetch(`${API_BASE_URL}/trading/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
      if (!response.ok) {
        throw new Error('Failed to reject proposal');
      }
      return response.json();
    }
  }
};