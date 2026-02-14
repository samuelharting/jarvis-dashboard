import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { OverviewResponse } from '../../../shared/types';

export const Overview: React.FC = () => {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [sources, setSources] = useState<any>(null);
  const [showSources, setShowSources] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const sourcesData = await api.sources.getSources();
      setSources(sourcesData);
    } catch (err) {
      // Sources errors are non-critical, don't set error state
      console.warn('Failed to fetch sources:', err);
    }
  };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const overviewData = await api.overview.getOverview();
      setOverview(overviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h2>Jarvis Dashboard</h2>
      
      {loading && <p>Loading overview...</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '1rem', backgroundColor: '#ffe6e6', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {overview && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <strong>Server Time:</strong> {new Date(overview.serverTime).toLocaleString()}
          </div>

          {overview.warnings.length > 0 && (
            <Section title="Warnings">
              <ul>
                {overview.warnings.map((warning, index) => (
                  <li key={index} style={{ color: '#ff9800' }}>{warning}</li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Costs Today">
            <div>
              <strong>Cost:</strong> ${overview.costsTodayUsd ?? 'N/A'}
            </div>
          </Section>

          <Section title={`Agents (${overview.agents.length})`}>
            {overview.agents.length === 0 ? (
              <p>No agents found</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {overview.agents.map((agent) => (
                  <div key={agent.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>{agent.name}</strong> - {agent.state}</div>
                    <div>Last seen: {agent.lastSeen ? new Date(agent.lastSeen).toLocaleString() : 'Never'}</div>
                    {agent.summary && <div>Summary: {agent.summary}</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Cron Jobs (${overview.crons.length})`}>
            {overview.crons.length === 0 ? (
              <p>No cron jobs found</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {overview.crons.map((cron) => (
                  <div key={cron.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>{cron.id}</strong></div>
                    <div>Schedule: {cron.schedule ?? 'Unknown'}</div>
                    <div>Last run: {cron.lastRun ? new Date(cron.lastRun).toLocaleString() : 'Never'}</div>
                    <div>Result: {cron.lastResult}</div>
                    {cron.note && <div>Note: {cron.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Bots (${overview.bots.length})`}>
            {overview.bots.length === 0 ? (
              <p>No bots found</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {overview.bots.map((bot) => (
                  <div key={bot.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>{bot.name}</strong></div>
                    <div>PNL: ${bot.pnl.toFixed(2)}</div>
                    <div>Trades: {bot.trades}</div>
                    {bot.winRate !== null && <div>Win Rate: {(bot.winRate * 100).toFixed(1)}%</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Sources">
            <button 
              onClick={() => setShowSources(!showSources)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              {showSources ? 'Hide' : 'Show'} Data Sources
            </button>
            
            {showSources && sources && (
              <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}>
                <div><strong>Data Root:</strong> {sources.dataRoot}</div>
                <div><strong>OpenClaw Root:</strong> {sources.openClawRoot ?? 'Not set'}</div>
                <div><strong>Agents:</strong> {sources.agentsPath}</div>
                <div><strong>Crons:</strong> {sources.cronsPath}</div>
                <div><strong>Bots Dir:</strong> {sources.botsPath}</div>
                <div><strong>Costs:</strong> {sources.costsPath}</div>
              </div>
            )}
          </Section>

          <button 
            onClick={fetchOverview}
            style={{ 
              marginTop: '2rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Overview
          </button>
        </div>
      )}
    </div>
  );
};