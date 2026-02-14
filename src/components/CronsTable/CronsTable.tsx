import React, { useState, useMemo } from 'react';
import { CronJobStatus } from '../../../shared/types';

interface CronsTableProps {
  crons: CronJobStatus[];
  loading?: boolean;
}

export const CronsTable: React.FC<CronsTableProps> = ({ crons, loading = false }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'lastRun' | 'schedule'>('lastRun');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [resultFilter, setResultFilter] = useState<string>('all');

  const filteredAndSortedCrons = useMemo(() => {
    let filtered = crons.filter(cron => {
      const matchesSearch = search === '' || 
        cron.id.toLowerCase().includes(search.toLowerCase()) ||
        (cron.note && cron.note.toLowerCase().includes(search.toLowerCase()));
      
      const matchesResult = resultFilter === 'all' || cron.lastResult === resultFilter;
      
      return matchesSearch && matchesResult;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'id':
          aValue = a.id.toLowerCase();
          bValue = b.id.toLowerCase();
          break;
        case 'lastRun':
          aValue = a.lastRun ? new Date(a.lastRun).getTime() : 0;
          bValue = b.lastRun ? new Date(b.lastRun).getTime() : 0;
          break;
        case 'schedule':
          aValue = a.schedule || '';
          bValue = b.schedule || '';
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
  }, [crons, search, sortBy, sortOrder, resultFilter]);

  const getResultColor = (result: CronJobStatus['lastResult']) => {
    switch (result) {
      case 'success': return '#10b981'; // green
      case 'fail': return '#ef4444'; // red
      case 'unknown': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return 'Never';
    
    const date = new Date(lastRun);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatSchedule = (schedule: string | null) => {
    if (!schedule) return '-';
    
    // Simple cron format explanation
    const parts = schedule.split(' ');
    if (parts.length === 5) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      
      // Very basic human-readable format
      if (minute === '0' && hour === '2' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        return 'Daily at 2:00 AM';
      }
      if (minute === '*/15' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        return 'Every 15 minutes';
      }
      if (minute === '0' && hour === '*/6' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        return 'Every 6 hours';
      }
    }
    
    return schedule;
  };

  const handleSort = (column: 'id' | 'lastRun' | 'schedule') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'lastRun' ? 'desc' : 'asc');
    }
  };

  const SortIcon: React.FC<{ column: 'id' | 'lastRun' | 'schedule' }> = ({ column }) => {
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
        Loading cron jobs...
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
            placeholder="Search cron jobs..."
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
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
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
          <option value="all">All Results</option>
          <option value="success">Success</option>
          <option value="fail">Failed</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Table */}
      {filteredAndSortedCrons.length === 0 ? (
        <div style={{ 
          padding: '3rem 1rem', 
          textAlign: 'center', 
          color: '#6b7280',
          border: '1px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          {search || resultFilter !== 'all' ? 'No cron jobs match your filters' : 'No cron jobs found'}
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
            minWidth: '700px'
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
                  onClick={() => handleSort('id')}
                >
                  ID <SortIcon column="id" />
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
                  onClick={() => handleSort('schedule')}
                >
                  Schedule <SortIcon column="schedule" />
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
                  onClick={() => handleSort('lastRun')}
                >
                  Last Run <SortIcon column="lastRun" />
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
                  Result
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
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCrons.map((cron) => (
                <tr 
                  key={cron.id}
                  style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 500 }}>
                    {cron.id}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                    <div style={{ marginBottom: '0.25rem' }}>{formatSchedule(cron.schedule)}</div>
                    {cron.schedule && cron.schedule !== formatSchedule(cron.schedule) && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                        {cron.schedule}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                    {formatLastRun(cron.lastRun)}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: `${getResultColor(cron.lastResult)}15`,
                        color: getResultColor(cron.lastResult),
                        border: `1px solid ${getResultColor(cron.lastResult)}30`,
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      <div
                        style={{
                          width: '0.375rem',
                          height: '0.375rem',
                          backgroundColor: getResultColor(cron.lastResult),
                          borderRadius: '50%',
                          flexShrink: 0,
                        }}
                      />
                      {cron.lastResult}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                    {cron.note || '-'}
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
          Showing {filteredAndSortedCrons.length} of {crons.length} cron jobs
          {(search || resultFilter !== 'all') && ' (filtered)'}
        </div>
        <div style={{ fontSize: '0.75rem' }}>
          Sorted by {sortBy} ({sortOrder})
        </div>
      </div>
    </div>
  );
};