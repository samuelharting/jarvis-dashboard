import React, { useState } from 'react';

export const Trading: React.FC = () => {
  const [activeFleet, setActiveFleet] = useState<'polymarket' | 'options' | 'futures'>('polymarket');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockScoreboard = {
    tournament: "Polymarket Bot Championship",
    generated_at: new Date().toISOString(),
    scoreboard: [
      {
        name: "closing_soon",
        score: 895.75,
        real_trades: 2,
        paper_pnl: 31.68,
        staleness_status: "active",
        status: "running"
      },
      {
        name: "arb_scanner",
        score: 224.2,
        real_trades: 0,
        paper_pnl: 0.0,
        staleness_status: "stale",
        status: "unknown"
      }
    ],
    kill_proposals: [],
    staleness_rules: {
      stale_threshold_minutes: 30,
      dead_threshold_minutes: 120,
      auto_kill_proposal: true
    }
  };

  const mockPending = {
    total_pending: 2,
    pending_trades: [
      {
        trade_id: "closing_soon_614807_20260214T21590",
        bot: "closing_soon",
        market_id: "614807",
        question: "Will Sinners win Best Cinematography at the 98th Academy Awards?",
        side: "NO",
        entry_price: 0.565,
        expected_edge_pct: 62.8,
        expected_pnl: 11.38,
        status: "open"
      },
      {
        trade_id: "closing_soon_614805_20260214T21590",
        bot: "closing_soon",
        market_id: "614805",
        question: "Will One Battle After Another win Best Cinematography at the 98th Academy Awards?",
        side: "NO",
        entry_price: 0.575,
        expected_edge_pct: 60.0,
        expected_pnl: 10.30,
        status: "open"
      }
    ]
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Scoreboard</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
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
                  {mockScoreboard.scoreboard.map((bot, index) => (
                    <tr key={bot.name} style={{ borderBottom: index < mockScoreboard.scoreboard.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
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
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {mockScoreboard.kill_proposals.length} pending
                </span>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                minHeight: '200px'
              }}>
                {mockScoreboard.kill_proposals.length === 0 ? (
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
                ) : (
                  <div>Proposals list will appear here</div>
                )}
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
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {mockPending.total_pending} open
                </span>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                minHeight: '200px'
              }}>
                {mockPending.pending_trades.length === 0 ? (
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
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mockPending.pending_trades.map((trade) => (
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
                )}
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