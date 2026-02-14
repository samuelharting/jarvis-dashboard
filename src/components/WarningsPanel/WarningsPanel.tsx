import React, { useState } from 'react';

export type WarningSeverity = 'error' | 'warning' | 'info';
export type WarningSource = 'agent' | 'cron' | 'bot' | 'system' | 'gateway';

export interface Warning {
  id: string;
  message: string;
  severity: WarningSeverity;
  source: WarningSource;
  timestamp: string;
  actionable: boolean;
  targetId?: string; // ID of the agent/cron/bot this warning relates to
  targetType?: 'agent' | 'cron' | 'bot';
}

interface WarningsPanelProps {
  warnings: Warning[];
  onWarningClick?: (warning: Warning) => void;
  maxHeight?: string;
}

export const WarningsPanel: React.FC<WarningsPanelProps> = ({ 
  warnings, 
  onWarningClick,
  maxHeight = '300px'
}) => {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<WarningSeverity | 'all'>('all');

  const filteredWarnings = warnings.filter(warning => 
    filter === 'all' || warning.severity === filter
  );

  const getSeverityColor = (severity: WarningSeverity) => {
    switch (severity) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: WarningSeverity) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getSourceIcon = (source: WarningSource) => {
    switch (source) {
      case 'agent': return '🤖';
      case 'cron': return '⏰';
      case 'bot': return '🔄';
      case 'system': return '⚙️';
      case 'gateway': return '🚪';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const severityCounts = {
    error: warnings.filter(w => w.severity === 'error').length,
    warning: warnings.filter(w => w.severity === 'warning').length,
    info: warnings.filter(w => w.severity === 'info').length,
  };

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          backgroundColor: '#f9fafb',
          borderBottom: expanded ? '1px solid #e5e7eb' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Warnings & Alerts</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {severityCounts.error > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}>
                <span>❌</span>
                <span>{severityCounts.error}</span>
              </div>
            )}
            
            {severityCounts.warning > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}>
                <span>⚠️</span>
                <span>{severityCounts.warning}</span>
              </div>
            )}
            
            {severityCounts.info > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}>
                <span>ℹ️</span>
                <span>{severityCounts.info}</span>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {expanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div>
          {/* Filter buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
          }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: filter === 'all' ? '#3b82f6' : 'white',
                color: filter === 'all' ? 'white' : '#6b7280',
                border: `1px solid ${filter === 'all' ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: filter === 'all' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              All ({warnings.length})
            </button>
            
            <button
              onClick={() => setFilter('error')}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: filter === 'error' ? '#ef4444' : 'white',
                color: filter === 'error' ? 'white' : '#dc2626',
                border: `1px solid ${filter === 'error' ? '#ef4444' : '#fecaca'}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: filter === 'error' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Errors ({severityCounts.error})
            </button>
            
            <button
              onClick={() => setFilter('warning')}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: filter === 'warning' ? '#f59e0b' : 'white',
                color: filter === 'warning' ? 'white' : '#d97706',
                border: `1px solid ${filter === 'warning' ? '#f59e0b' : '#fde68a'}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: filter === 'warning' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Warnings ({severityCounts.warning})
            </button>
            
            <button
              onClick={() => setFilter('info')}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: filter === 'info' ? '#3b82f6' : 'white',
                color: filter === 'info' ? 'white' : '#2563eb',
                border: `1px solid ${filter === 'info' ? '#3b82f6' : '#dbeafe'}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: filter === 'info' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              Info ({severityCounts.info})
            </button>
          </div>

          {/* Warnings list */}
          <div style={{ maxHeight, overflowY: 'auto' }}>
            {filteredWarnings.length === 0 ? (
              <div style={{ 
                padding: '2rem 1.5rem', 
                textAlign: 'center', 
                color: '#6b7280',
                backgroundColor: 'white'
              }}>
                No {filter === 'all' ? '' : filter} warnings
              </div>
            ) : (
              <div>
                {filteredWarnings.map((warning) => (
                  <div
                    key={warning.id}
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: 'white',
                      cursor: warning.actionable ? 'pointer' : 'default',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => warning.actionable && onWarningClick?.(warning)}
                    onMouseEnter={(e) => {
                      if (warning.actionable) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (warning.actionable) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      {/* Severity icon */}
                      <div style={{ 
                        fontSize: '1.25rem',
                        flexShrink: 0,
                        color: getSeverityColor(warning.severity)
                      }}>
                        {getSeverityIcon(warning.severity)}
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <div style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.125rem 0.5rem',
                            backgroundColor: `${getSeverityColor(warning.severity)}15`,
                            color: getSeverityColor(warning.severity),
                            border: `1px solid ${getSeverityColor(warning.severity)}30`,
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}>
                            {warning.severity}
                          </div>
                          
                          <div style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.125rem 0.5rem',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            border: '1px solid #e5e7eb',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                          }}>
                            <span>{getSourceIcon(warning.source)}</span>
                            <span>{warning.source}</span>
                          </div>
                          
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#9ca3af',
                            marginLeft: 'auto',
                            flexShrink: 0
                          }}>
                            {formatTimestamp(warning.timestamp)}
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {warning.message}
                        </div>
                        
                        {warning.targetId && warning.targetType && (
                          <div style={{ 
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            Related to: <span style={{ fontWeight: 500 }}>{warning.targetType}</span> • <span style={{ fontFamily: 'monospace' }}>{warning.targetId}</span>
                          </div>
                        )}
                        
                        {warning.actionable && (
                          <div style={{ 
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <span>Click to view →</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};