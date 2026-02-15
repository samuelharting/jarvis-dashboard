import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface CronJob {
  id: string;
  schedule: string | null;
  lastRun: string | null;
  lastResult: 'success' | 'fail' | 'unknown';
  note: string | null;
}

const getStatusIcon = (result: string) => {
  switch (result) {
    case 'success': return '✅';
    case 'fail': return '❌';
    default: return '⏸️';
  }
};

const getStatusColor = (result: string) => {
  switch (result) {
    case 'success': return '#22c55e';
    case 'fail': return '#ef4444';
    default: return '#6b7280';
  }
};

export const Cron: React.FC = () => {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadCrons();
  }, []);

  const loadCrons = async () => {
    try {
      const response = await api.overview.getOverview();
      if (response.ok && response.crons) {
        setCrons(response.crons);
      }
    } catch (error) {
      console.error('Error loading crons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrons = crons.filter(cron => 
    cron.id.toLowerCase().includes(filter.toLowerCase()) ||
    (cron.note && cron.note.toLowerCase().includes(filter.toLowerCase()))
  );

  const getMinutesAgo = (timestamp?: string | null) => {
    if (!timestamp) return 'Never';
    const minutes = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return Math.round(minutes) + 'm ago';
    if (minutes < 1440) return Math.round(minutes / 60) + 'h ago';
    return Math.round(minutes / 1440) + 'd ago';
  };

  const getFormattedDate = (timestamp?: string | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
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
            Scheduled Jobs
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
            Loading scheduled task data...
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
              Scheduled Jobs
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
              System maintenance and automation tasks
            </p>
          </div>
          <div style={{ color: '#94a3b8' }}>
            {crons.length} total jobs
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
          placeholder="Filter cron jobs..."
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

      {/* Cron Table */}
      <div style={{
        background: 'rgba(12, 45, 98, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'rgba(30, 64, 175, 0.2)',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
          fontWeight: '600',
          color: '#60a5fa',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div>Job Name</div>
          <div>Schedule</div>
          <div>Last Run</div>
          <div>Status</div>
          <div>Note</div>
        </div>

        {filteredCrons.length > 0 ? (
          filteredCrons.map((cron, index) => (
            <div key={cron.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
              gap: '1rem',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: index < filteredCrons.length - 1 ? '1px solid rgba(96, 165, 250, 0.1)' : 'none'
            }}>
              <div style={{ color: '#60a5fa', fontWeight: '500' }}>{cron.id}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {cron.schedule || 'Ad-hoc'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {getFormattedDate(cron.lastRun)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: getStatusColor(cron.lastResult),
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                <span>{getStatusIcon(cron.lastResult)}</span>
                {cron.lastResult.toUpperCase()}
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: '1.3'
              }}>
                {cron.note || 'No description'}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>
              ⏰
            </div>
            <div style={{ fontSize: '1.125rem' }}>
              {filter ? 'No cron jobs match your filter' : 'No scheduled jobs found'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};