import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export const Trading: React.FC = () => {
  const [activeFleet, setActiveFleet] = useState<'polymarket' | 'options' | 'futures'>('polymarket');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoreboard, setScoreboard] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Fetch trading data
  const fetchTradingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [scoreboardResponse, pendingResponse] = await Promise.all([
        api.trading.getScoreboard(),
        api.trading.getPending()
      ]);
      
      if (scoreboardResponse.ok && pendingResponse.ok) {
        setScoreboard(scoreboardResponse.data);
        setPending(pendingResponse.data);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error('API returned error status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trading data');
      console.error('Error fetching trading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTradingData();
  }, []);

  // Handle proposal actions
  const handleApproveProposal = async (proposalId: string) => {
    try {
      await api.trading.approveProposal(proposalId);
      // Refresh data after action
      await fetchTradingData();
    } catch (err: any) {
      setError(`Failed to approve proposal: ${err.message}`);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await api.trading.rejectProposal(proposalId, 'Rejected via UI');
      // Refresh data after action
      await fetchTradingData();
    } catch (err: any) {
      setError(`Failed to reject proposal: ${err.message}`);
    }
  };

  const fleetTabs = [
    { id: 'polymarket', label: 'Polymarket', color: '#3b82f6' },
    { id: 'options', label: 'Options', color: '#10b981' },
    { id: 'futures', label: 'Futures', color: '#8b5cf6' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Trading Tournament
        </h1>
        <p style={{ color: '#6b7280' }}>
          Monitor bot performance, pending trades, and manage kill proposals
        </p>
      </div>

      {/* Fleet Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        {fleetTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFleet(tab.id as any)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeFleet === tab.id ? tab.color : 'transparent',
              color: activeFleet === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderBottom: activeFleet === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeFleet === tab.id ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fleet Content */}
      {activeFleet === 'polymarket' && (
        <div>
          {/* Scoreboard Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>Scoreboard</h2>
                {scoreboard && (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Updated: {new Date(scoreboard.generated_at).toLocaleTimeString()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {loading && (
                  <div style={{ 
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}>
                    Loading...
                  </div>
                )}
                <button 
                  onClick={fetchTradingData}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Refresh
                </button>
                <button 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Export
                </button>
              </div>
            </div>

            {loading && !scoreboard ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                padding: '3rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#6b7280' }}>⏳</div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Loading scoreboard...</div>
                <div style={{ color: '#9ca3af' }}>Fetching tournament data from API</div>
              </div>
            ) : error ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #fecaca',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>⚠️</div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#991b1b' }}>Failed to load data</div>
                <div style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</div>
                <button 
                  onClick={fetchTradingData}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Retry
                </button>
              </div>
            ) : scoreboard ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Bot</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Score</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Real Trades</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Paper P&L</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Staleness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboard.scoreboard.map((bot: any, index: number) => (
                      <tr key={bot.name} style={{ borderBottom: index < scoreboard.scoreboard.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                        <td style={{ padding: '1rem' }}>{bot.name}</td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{bot.score.toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>{bot.real_trades}</td>
                        <td style={{ padding: '1rem', color: bot.paper_pnl >= 0 ? '#10b981' : '#ef4444' }}>
                          ${bot.paper_pnl.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            backgroundColor: bot.status === 'running' ? '#d1fae5' : '#f3f4f6',
                            color: bot.status === 'running' ? '#065f46' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {bot.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            backgroundColor: bot.staleness_status === 'active' ? '#d1fae5' : 
                                           bot.staleness_status === 'stale' ? '#fef3c7' : '#fee2e2',
                            color: bot.staleness_status === 'active' ? '#065f46' : 
                                  bot.staleness_status === 'stale' ? '#92400e' : '#991b1b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {bot.staleness_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {/* Two-column layout for Proposals and Trades */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Proposals Column */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Kill Proposals</h2>
                {scoreboard && (
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: scoreboard.kill_proposals?.length > 0 ? '#fef3c7' : '#f3f4f6',
                    color: scoreboard.kill_proposals?.length > 0 ? '#92400e' : '#6b7280',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: scoreboard.kill_proposals?.length > 0 ? '600' : '400'
                  }}>
                    {scoreboard.kill_proposals?.length || 0} pending
                  </span>
                )}
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                minHeight: '200px'
              }}>
                {loading && !scoreboard ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '150px',
                    color: '#9ca3af'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                    <div>Loading proposals...</div>
                  </div>
                ) : scoreboard?.kill_proposals?.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '150px',
                    color: '#9ca3af'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
                    <div>No kill proposals pending</div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>All bots are healthy</div>
                  </div>
                ) : scoreboard?.kill_proposals?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {scoreboard.kill_proposals.map((proposal: any) => (
                      <div key={proposal.proposal_id} style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        backgroundColor: '#f9fafb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: '600' }}>{proposal.bot_name}</div>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: proposal.status === 'pending' ? '#fef3c7' : 
                                           proposal.status === 'approved' ? '#d1fae5' : '#fee2e2',
                            color: proposal.status === 'pending' ? '#92400e' : 
                                  proposal.status === 'approved' ? '#065f46' : '#991b1b',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {proposal.status || 'pending'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                          {proposal.reason}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                          Proposed: {new Date(proposal.proposed_at).toLocaleString()}
                        </div>
                        {proposal.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleApproveProposal(proposal.proposal_id)}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                flex: 1
                              }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectProposal(proposal.proposal_id)}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                flex: 1
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Trades Column */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Pending Trades</h2>
                {pending && (
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: pending.total_pending > 0 ? '#3b82f6' : '#f3f4f6',
                    color: pending.total_pending > 0 ? 'white' : '#6b7280',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {pending.total_pending} open
                  </span>
                )}
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                minHeight: '200px'
              }}>
                {loading && !pending ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '150px',
                    color: '#9ca3af'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                    <div>Loading trades...</div>
                  </div>
                ) : pending?.pending_trades?.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '150px',
                    color: '#9ca3af'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
                    <div>No pending trades</div>
                  </div>
                ) : pending?.pending_trades?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pending.pending_trades.map((trade: any) => (
                      <div key={trade.trade_id} style={{
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        backgroundColor: '#f9fafb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {trade.bot} • {trade.market_id}
                          </div>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: trade.side === 'YES' ? '#d1fae5' : '#fee2e2',
                            color: trade.side === 'YES' ? '#065f46' : '#991b1b',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {trade.side}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280',
                          marginBottom: '0.5rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {trade.question}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <div>
                            <span style={{ color: '#6b7280' }}>Entry: </span>
                            <span style={{ fontWeight: '600' }}>{trade.entry_price}</span>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>Edge: </span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>{trade.expected_edge_pct}%</span>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>P&L: </span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>${trade.expected_pnl.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeFleet === 'options' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>📈</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Options Fleet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Options trading bots coming soon. This section will show options-specific scoreboards and trades.
          </p>
          <button 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            disabled
          >
            Coming Soon
          </button>
        </div>
      )}

      {activeFleet === 'futures' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#8b5cf6' }}>⚡</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Futures Fleet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Futures trading bots coming soon. This section will show futures-specific scoreboards and trades.
          </p>
          <button 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            disabled
          >
            Coming Soon
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          color: '#991b1b'
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};