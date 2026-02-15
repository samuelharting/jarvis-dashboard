import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Agent {
  id: string;
  name: string;
  state: 'running' | 'idle' | 'error' | 'unknown';
  lastSeen: string | null;
  summary: string | null;
}

const getStatusColor = (state: string) => {
  switch (state) {
    case 'running': return '#22c55e';
    case 'idle': return '#f59e0b';
    case 'error': return '#ef4444';
    default: return '#6b7280';
  }
};

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await api.overview.getOverview();
      if (response.ok && response.agents) {
        setAgents(response.agents);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(filter.toLowerCase()) ||
    agent.state.toLowerCase().includes(filter.toLowerCase()) ||
    (agent.summary && agent.summary.toLowerCase().includes(filter.toLowerCase()))
  );

  const getMinutesAgo = (timestamp?: string | null) => {
    if (!timestamp) return null;
    const minutes = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60);
    return Math.round(minutes);
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'running': return '🟢';
      case 'idle': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
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
            Agents
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
            Loading agent fleet status...
          </p>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#60a5fa',
              marginBottom: '0.5rem',
              textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
            }}>
              Agent Fleet
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
              AI agent orchestration and monitoring
            </p>
          </div>
          <div style={{ color: '#94a3b8' }}>
            {agents.length} agents active
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Agents', value: agents.length, color: '#60a5fa' },
          { label: 'Running', value: agents.filter(a => a.state === 'running').length, color: '#22c55e' },
          { label: 'Idle', value: agents.filter(a => a.state === 'idle').length, color: '#f59e0b' },
          { label: 'Error', value: agents.filter(a => a.state === 'error').length, color: '#ef4444' }
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'linear-gradient(135deg, rgba(22, 78, 99, 0.3) 0%, rgba(30, 64, 175, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(96, 165, 250, 0.15)'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
              {stat.value}
            </div>
          </div>
        ))}
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
          placeholder="Filter agents by name or status..."
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

      {/* Agent List */}
      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {filteredAgents.map((agent) => (
          <div key={agent.id} style={{
            background: 'linear-gradient(135deg, rgba(22, 78, 99, 0.3) 0%, rgba(30, 64, 175, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(96, 165, 250, 0.15)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#60a5fa', margin: 0, fontSize: '1.125rem' }}>
                  {agent.name}
                </h3>
                <div style={{
                  color: getStatusColor(agent.state),
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.25rem'
                }}>
                  <span>{getStatusIcon(agent.state)}</span>
                  {agent.state}
                </div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'right' }}>
                {agent.lastSeen ? (`
                  Last seen: ${getMinutesAgo(agent.lastSeen)}m ago
                `) : 'Never seen'}
              </div>
            </div>

            {agent.summary && (
              <div style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: '1.4'
              }}>
                {agent.summary}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: '#94a3b8'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>
            👥
          </div>
          <div style={{ fontSize: '1.125rem' }}>
            {filter ? 'No agents match your filter' : 'No agents found'}
          </div>
        </div>
      )}
    </div>
  );
};