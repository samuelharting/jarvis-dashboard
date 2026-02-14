import React, { useState, useMemo } from 'react';
import { AgentStatus } from '../../../shared/types';
import { StatusChip } from '../StatusChip/StatusChip';

interface AgentsTableProps {
  agents: AgentStatus[];
  loading?: boolean;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({ agents, loading = false }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'state' | 'lastSeen'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = search === '' || 
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.id.toLowerCase().includes(search.toLowerCase()) ||
        (agent.summary && agent.summary.toLowerCase().includes(search.toLowerCase()));
      
      const matchesState = stateFilter === 'all' || agent.state === stateFilter;
      
      return matchesSearch && matchesState;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'state':
          aValue = a.state;
          bValue = b.state;
          break;
        case 'lastSeen':
          aValue = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
          bValue = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
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
  }, [agents, search, sortBy, sortOrder, stateFilter]);

  const getStateType = (state: AgentStatus['state']): 'online' | 'idle' | 'error' | 'warning' => {
    switch (state) {
      case 'running': return 'online';
      case 'idle': return 'idle';
      case 'error': return 'error';
      case 'unknown': return 'warning';
      default: return 'warning';
    }
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSort = (column: 'name' | 'state' | 'lastSeen') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon: React.FC<{ column: 'name' | 'state' | 'lastSeen' }> = ({ column }) => {
    if (sortBy !== column) return null;
    
    return (
      <span style={{ marginLeft: '0.25rem' }}>
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Loading agents...
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search agents..."
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
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
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
          <option value="all">All States</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="error">Error</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Table */}
      {filteredAndSortedAgents.length === 0 ? (
        <div style={{ 
          padding: '3rem 1rem', 
          textAlign: 'center', 
          color: '#6b7280',
          border: '1px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          {search || stateFilter !== 'all' ? 'No agents match your filters' : 'No agents found'}
        </div>
      ) : (
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          overflow: 'hidden',
          overflowX: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('name')}
                >
                  Name <SortIcon column="name" />
                </th>
                <th 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('state')}
                >
                  State <SortIcon column="state" />
                </th>
                <th 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('lastSeen')}
                >
                  Last Seen <SortIcon column="lastSeen" />
                </th>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAgents.map((agent) => (
                <tr 
                  key={agent.id}
                  style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{agent.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{agent.id}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <StatusChip 
                      type={getStateType(agent.state)} 
                      label={agent.state.charAt(0).toUpperCase() + agent.state.slice(1)}
                      size="sm"
                    />
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                    {formatLastSeen(agent.lastSeen)}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                    {agent.summary || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          Showing {filteredAndSortedAgents.length} of {agents.length} agents
          {(search || stateFilter !== 'all') && ' (filtered)'}
        </div>
        <div style={{ fontSize: '0.75rem' }}>
          Sorted by {sortBy} ({sortOrder})
        </div>
      </div>
    </div>
  );
};