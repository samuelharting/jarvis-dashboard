import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Bot {
  id: string;
  name: string;
  pnl: number;
  dailyPnl: number;
  trades: number;
  winRate: number | null;
  lastHeartbeatUtc?: string;
  heartbeatStatus?: string;
  fleet?: string;
  mode?: string;
  status?: string;
}

const getHeartbeatColor = (status?: string) => {
  switch (status) {
    case 'green': return '#22c55e';
    case 'yellow': return '#f59e0b';
    case 'red': return '#ef4444';
    default: return '#6b7280';
  }
};

export const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadBots();
    const interval = setInterval(loadBots, 30000); // 30-second real-time refresh
    return () => clearInterval(interval);
  }, []);

  const loadBots = async () => {
    try {
      const response = await api.overview.getOverview();
      if (response.ok && response.bots) {
        setBots(response.bots);
      }
    } catch (error) {
      console.error('Error loading bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(filter.toLowerCase()) ||
    bot.fleet?.toLowerCase().includes(filter.toLowerCase()) ||
    bot.status?.toLowerCase().includes(filter.toLowerCase())
  );

  const getMinutesAgo = (timestamp?: string) => {
    if (!timestamp) return null;
    const minutes = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60);
    return Math.round(minutes);
  };

  if (loading) {
    return (
      <div style={{ color: '#e2e8f0' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(12, 45, 98, 0.5) 0%, rgba(30, 58, 138, 0.3) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          boxShadow: '0 8px 32px rgba(12, 45, 98, 0.3)'
        }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#60a5fa',
            marginBottom: '0.5rem',
            textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
          }}>
            Bot Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
            Loading bot fleet data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#FFFFFF', background: '#0a0a0a' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#60a5fa',
              marginBottom: '0.5rem',
              textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
            }}>
              Bot Management
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
              Complete fleet overview across all missions
            </p>
          </div>
          <div style={{ color: '#94a3b8' }}>
            Total: {bots.length} active bots
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: 'rgba(30, 64, 175, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(96, 165, 250, 0.2)'
      }}>
        <input
          type="text"
          placeholder="Filter bots by name, fleet, or status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: '0.5rem',
            color: '#e2e8f0',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      {/* Bot Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredBots.map((bot) => (
          <div key={bot.id} style={{
            background: '#111111',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(96, 165, 250, 0.15)',
            transition: 'transform 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#60a5fa', margin: 0, fontSize: '1.125rem' }}>
                  {bot.name}
                </h3>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {bot.fleet} • {bot.mode}
                </div>
              </div>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: getHeartbeatColor(bot.heartbeatStatus)
              }}/>
            </div>

            {bot.status && (
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                Status: {bot.status}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Total P&L</div>
                <div style={{ color: bot.pnl >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.125rem', fontWeight: 'bold' }}>
                  ${bot.pnl.toFixed(2)}
                </div>
              </div>
              
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Daily P&L</div>
                <div style={{ color: bot.dailyPnl >= 0 ? '#22c55e' : '#ef4444', fontSize: '1.125rem', fontWeight: 'bold' }}>
                  ${bot.dailyPnl.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Trades</div>
                <div style={{ color: '#60a5fa', fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {bot.trades}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Win Rate</div>
                <div style={{ color: '#60a5fa', fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {bot.winRate !== null ? (bot.winRate * 100).toFixed(1) + '%' : 'N/A'}
                </div>
              </div>
            </div>

            {bot.lastHeartbeatUtc && (
              <div style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                marginTop: '0.75rem',
                textAlign: 'center'
              }}>
                Last check: {Math.abs(getMinutesAgo(bot.lastHeartbeatUtc) || 0)}m ago
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBots.length === 0 && (
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '4rem 2rem',
          color: '#94a3b8'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>
            🤖
          </div>
          <div style={{ fontSize: '1.125rem' }}>
            {filter ? 'No bots match your filter' : 'No bots found'}
          </div>
        </div>
      )}
    </div>
  );
};