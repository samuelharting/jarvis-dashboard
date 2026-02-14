import { HealthResponse, OverviewResponse } from '../../shared/types';

const API_BASE_URL = 'http://localhost:3031/api';

interface SourcesResponse {
  ok: true;
  dataRoot: string;
  openClawRoot: string | null;
  agentsPath: string;
  cronsPath: string;
  botsPath: string;
  costsPath: string;
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
  }
};