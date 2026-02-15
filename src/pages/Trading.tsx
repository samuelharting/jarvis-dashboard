import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface ScoreboardEntry {
  name: string;
  score: number;
  real_trades: number;
  paper_pnl: number;
  staleness_status: string;
  status: string;
  [key: string]: any;
}

interface KillProposal {
  proposal_id: string;
  bot_name: string;
  reason: string;
  status: string;
  [key: string]: any;
}

interface PendingTrade {
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
}

export const Trading: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scoreboard' | 'pending' | 'kill'>('scoreboard');
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[] | null>(null);
  const [killProposals, setKillProposals] = useState<KillProposal[]>([]);
  const [pending, setPending] = useState<{ total_pending: number; pending_trades: PendingTrade[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [scoreboardRes, pendingRes] = await Promise.allSettled([
        api.trading.getScoreboard(),
        api.trading.getPending()
      ]);

      if (scoreboardRes.status === 'fulfilled' && scoreboardRes.value?.ok && scoreboardRes.value?.data) {
        const data = scoreboardRes.value.data;
        setScoreboard(data.scoreboard || []);
        setKillProposals(data.kill_proposals || []);
        setGeneratedAt(data.generated_at || scoreboardRes.value.generated_at || null);
      } else {
        setScoreboard(null);
        setKillProposals([]);
      }

      if (pendingRes.status === 'fulfilled' && pendingRes.value?.ok && pendingRes.value?.data) {
        setPending(pendingRes.value.data);
      } else {
        setPending(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trading data');
      setScoreboard(null);
      setKillProposals([]);
      setPending(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30-second refresh
    return () => clearInterval(interval);
  }, [loadData]);

  const handleApproveProposal = async (proposalId: string) => {
    try {
      await api.trading.approveProposal(proposalId);
      loadData();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await api.trading.rejectProposal(proposalId);
      loadData();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const hasScoreboard = scoreboard && scoreboard.length > 0;
  const hasPending = pending && (pending.pending_trades?.length || 0) > 0;
  const hasKillProposals = killProposals.length > 0;
  const hasData = hasScoreboard || hasPending || hasKillProposals;

  const buttonStyle = (active: boolean, color: string) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    backgroundColor: active ? color : 'transparent',
    color: active ? '#0f172a' : '#e2e8f0',
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: active ? `0 4px 12px ${color}33` : 'none'
  });

  return (
    <div style={{ color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(12, 45, 98, 0.5) 0%, rgba(30, 58, 138, 0.3) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        boxShadow: '0 8px 32px rgba(12, 45, 98, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#60a5fa',
              marginBottom: '0.5rem',
              textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
            }}>
              Trading Tournament
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
              Multi-fleet trading competition and kill/clone decisions
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {generatedAt && (
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Updated: {new Date(generatedAt).toLocaleString()}
              </span>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                background: 'rgba(96, 165, 250, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>⟳</span>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        background: 'rgba(30, 64, 175, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '0.5rem',
        border: '1px solid rgba(96, 165, 250, 0.2)'
      }}>
        <button onClick={() => setActiveTab('scoreboard')} style={buttonStyle(activeTab === 'scoreboard', '#60a5fa')}>
          📊 Scoreboard
        </button>
        <button onClick={() => setActiveTab('pending')} style={buttonStyle(activeTab === 'pending', '#22c55e')}>
          ⏳ Pending ({pending?.total_pending ?? 0})
        </button>
        <button onClick={() => setActiveTab('kill')} style={buttonStyle(activeTab === 'kill', '#f59e0b')}>
          ⚔️ Kill Proposals ({killProposals.length})
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: '#f87171'
        }}>
          {error}
        </div>
      )}

      {/* Scoreboard Tab */}
      {activeTab === 'scoreboard' && (
        <div style={{
          background: 'rgba(12, 45, 98, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          overflow: 'hidden'
        }}>
          {hasScoreboard ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(96, 165, 250, 0.1)', borderBottom: '1px solid rgba(96, 165, 250, 0.2)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#60a5fa' }}>Bot</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#60a5fa' }}>Score</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#60a5fa' }}>Real Trades</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#60a5fa' }}>Paper PnL</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#60a5fa' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#60a5fa' }}>Staleness</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreboard!.map((row, i) => (
                    <tr key={row.name + i} style={{ borderBottom: '1px solid rgba(96, 165, 250, 0.1)' }}>
                      <td style={{ padding: '1rem', color: '#e2e8f0' }}>{row.name}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#60a5fa' }}>{row.score}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{row.real_trades}</td>
                      <td style={{
                        padding: '1rem',
                        textAlign: 'right',
                        color: (row.paper_pnl || 0) >= 0 ? '#22c55e' : '#ef4444'
                      }}>
                        ${(row.paper_pnl || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{row.status || '—'}</td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{row.staleness_status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#60a5fa' }}>
                No Scoreboard Data
              </div>
              <p>Ensure scoreboard.json exists with schema_version: 1 in your trading directory.</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          overflow: 'hidden'
        }}>
          {hasPending ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(34, 197, 94, 0.1)', borderBottom: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#22c55e' }}>Bot</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#22c55e' }}>Question</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#22c55e' }}>Side</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#22c55e' }}>Edge %</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#22c55e' }}>Expected PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {pending!.pending_trades.map((t) => (
                    <tr key={t.trade_id} style={{ borderBottom: '1px solid rgba(34, 197, 94, 0.1)' }}>
                      <td style={{ padding: '1rem', color: '#e2e8f0' }}>{t.bot}</td>
                      <td style={{ padding: '1rem', color: '#94a3b8', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.question}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{t.side}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{(t.expected_edge_pct || 0).toFixed(2)}%</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: (t.expected_pnl || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                        ${(t.expected_pnl || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>⏳</div>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#22c55e' }}>
                No Pending Trades
              </div>
              <p>Pending trades will appear here when available.</p>
            </div>
          )}
        </div>
      )}

      {/* Kill Proposals Tab */}
      {activeTab === 'kill' && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          overflow: 'hidden'
        }}>
          {hasKillProposals ? (
            <div style={{ padding: '1.5rem' }}>
              {killProposals.map((p) => (
                <div
                  key={p.proposal_id}
                  style={{
                    padding: '1rem 1.5rem',
                    marginBottom: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '0.25rem' }}>{p.bot_name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{p.reason}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleApproveProposal(p.proposal_id)}
                        style={{
                          background: 'rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectProposal(p.proposal_id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>⚔️</div>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f59e0b' }}>
                No Kill Proposals
              </div>
              <p>Kill proposals will appear here when the system suggests terminating underperforming bots.</p>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
