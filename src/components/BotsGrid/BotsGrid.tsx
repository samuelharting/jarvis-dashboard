import React, { useState, useMemo } from 'react';
import { BotStats } from '../../../shared/types';

interface BotsGridProps {
  bots: BotStats[];
  loading?: boolean;
}

// Extended bot interface with additional fields (some may be null from API)
interface ExtendedBotStats extends BotStats {
  lastHeartbeat?: string | null;
  mode?: 'paper' | 'live' | 'unknown' | null;
  lastError?: string | null;
  openPositions?: number | null;
}

export const BotsGrid: React.FC<BotsGridProps> = ({ bots, loading = false }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'pnl' | 'trades' | 'winRate' | 'name'>('pnl');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modeFilter, setModeFilter] = useState<string>('all');

  // Extend bots with mock data for missing fields (in real app, API would provide these)
  const extendedBots: ExtendedBotStats[] = useMemo(() => {
    return bots.map((bot, index) => ({
      ...bot,
      lastHeartbeat: new Date(Date.now() - (index * 60000 * 30)).toISOString(), // Mock: 30 min intervals
      mode: index % 3 === 0 ? 'live' : index % 3 === 1 ? 'paper' : 'unknown',
      lastError: index % 5 === 0 ? `Error ${index}: Connection timeout` : null,
      openPositions: index % 2 === 0 ? Math.floor(Math.random() * 10) : 0,
    }));
  }, [bots]);

  const filteredAndSortedBots = useMemo(() => {
    let filtered = extendedBots.filter(bot => {
      const matchesSearch = search === '' || 
        bot.name.toLowerCase().includes(search.toLowerCase()) ||
        bot.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesMode = modeFilter === 'all' || bot.mode === modeFilter;
      
      return matchesSearch && matchesMode;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'pnl':
          aValue = a.pnl;
          bValue = b.pnl;
          break;
        case 'trades':
          aValue = a.trades;
          bValue = b.trades;
          break;
        case 'winRate':
          aValue = a.winRate ?? 0;
          bValue = b.winRate ?? 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [extendedBots, search, sortBy, sortOrder, modeFilter]);

  const formatLastHeartbeat = (lastHeartbeat: string | null | undefined) => {
    if (!lastHeartbeat) return 'Never';
    
    const date = new Date(lastHeartbeat);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getModeColor = (mode: string | null | undefined) => {
    switch (mode) {
      case 'live': return '#ef4444'; // red
      case 'paper': return '#3b82f6'; // blue
      case 'unknown': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const getPnlColor = (pnl: number) => {
    return pnl >= 0 ? '#10b981' : '#ef4444';
  };

  const handleSort = (column: 'pnl' | 'trades' | 'winRate' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'pnl' ? 'desc' : 'asc');
    }
  };

  const SortButton: React.FC<{ column: 'pnl' | 'trades' | 'winRate' | 'name'; label: string }> = ({ column, label }) => {
    const isActive = sortBy === column;
    
    return (
      <button
        onClick={() => handleSort(column)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.375rem 0.75rem',
          backgroundColor: isActive ? '#3b82f6' : 'transparent',
          color: isActive ? 'white' : '#6b7280',
          border: `1px solid ${isActive ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: isActive ? 500 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {label}
        {isActive && (
          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Loading bots...
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search bots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
          />
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
          }}>
            🔍
          </div>
        </div>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '120px',
          }}
        >
          <option value="all">All Modes</option>
          <option value="live">Live</option>
          <option value="paper">Paper</option>
          <option value="unknown">Unknown</option>
        </select>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <SortButton column="pnl" label="P&L" />
          <SortButton column="trades" label="Trades" />
          <SortButton column="winRate" label="Win Rate" />
          <SortButton column="name" label="Name" />
        </div>
      </div>

      {/* Grid */}
      {filteredAndSortedBots.length === 0 ? (
        <div style={{ 
          padding: '3rem 1rem', 
          textAlign: 'center', 
          color: '#6b7280',
          border: '1px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          {search || modeFilter !== 'all' ? 'No bots match your filters' : 'No bots found'}
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {filteredAndSortedBots.map((bot) => (
              <div
                key={bot.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                      {bot.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{bot.id}</div>
                  </div>
                  
                  <div
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: `${getModeColor(bot.mode)}15`,
                      color: getModeColor(bot.mode),
                      border: `1px solid ${getModeColor(bot.mode)}30`,
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  >
                    {bot.mode || 'unknown'}
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>P&L</div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 600, 
                      color: getPnlColor(bot.pnl)
                    }}>
                      ${bot.pnl.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Trades</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
                      {bot.trades}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Win Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
                      {bot.winRate ? `${(bot.winRate * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Open Positions</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
                      {bot.openPositions ?? 0}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Last Heartbeat</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{formatLastHeartbeat(bot.lastHeartbeat)}</div>
                  </div>
                  
                  {bot.lastError && (
                    <div style={{ 
                      padding: '0.75rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: '#dc2626'
                    }}>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Last Error</div>
                      <div style={{ fontSize: '0.75rem' }}>{bot.lastError}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ 
            marginTop: '1rem', 
            fontSize: '0.875rem', 
            color: '#6b7280',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              Showing {filteredAndSortedBots.length} of {bots.length} bots
              {(search || modeFilter !== 'all') && ' (filtered)'}
            </div>
            <div style={{ fontSize: '0.75rem' }}>
              Sorted by {sortBy} ({sortOrder})
            </div>
          </div>
        </>
      )}
    </div>
  );
};