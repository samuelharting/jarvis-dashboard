import React from 'react';
import { StatusChip, StatusType } from '../StatusChip/StatusChip';

interface TopBarProps {
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  statuses: {
    gateway: StatusType;
    api: StatusType;
    ui: StatusType;
    cron: StatusType;
    bots: StatusType;
  };
}

export const TopBar: React.FC<TopBarProps> = ({
  lastUpdated,
  onRefresh,
  isRefreshing,
  statuses
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      {/* Left side: Logo and status chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '1.5rem', 
            height: '1.5rem', 
            backgroundColor: '#3b82f6', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            J
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Jarvis Dashboard</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <StatusChip type={statuses.gateway} label="Gateway" size="sm" />
          <StatusChip type={statuses.api} label="API" size="sm" />
          <StatusChip type={statuses.ui} label="UI" size="sm" />
          <StatusChip type={statuses.cron} label="Cron" size="sm" />
          <StatusChip type={statuses.bots} label="Bots" size="sm" />
        </div>
      </div>

      {/* Right side: Last updated and refresh button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Last updated: <span style={{ fontWeight: 500 }}>{formatTime(lastUpdated)}</span>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.7 : 1,
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {isRefreshing ? (
            <>
              <div style={{ 
                width: '0.875rem', 
                height: '0.875rem', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Refreshing...
            </>
          ) : (
            <>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh Now
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .top-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .top-bar > div {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};