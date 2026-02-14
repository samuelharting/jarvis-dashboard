import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { OverviewResponse } from '../../../shared/types';
import { TopBar } from '../components/TopBar/TopBar';
import { WarningsPanel, Warning, WarningSeverity, WarningSource } from '../components/WarningsPanel/WarningsPanel';
import { AgentsTable } from '../components/AgentsTable/AgentsTable';
import { CronsTable } from '../components/CronsTable/CronsTable';
import { BotsGrid } from '../components/BotsGrid/BotsGrid';
import { ResponsiveGrid } from '../components/ResponsiveGrid/ResponsiveGrid';
import { StatusType } from '../components/StatusChip/StatusChip';

export const Overview: React.FC = () => {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [sources, setSources] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Mock warnings data (in real app, this would come from API)
  const [warnings, setWarnings] = useState<Warning[]>([
    {
      id: '1',
      message: 'Agent "Trade Bot Agent" has not reported in 45 minutes',
      severity: 'warning' as WarningSeverity,
      source: 'agent' as WarningSource,
      timestamp: new Date(Date.now() - 60000 * 30).toISOString(), // 30 min ago
      actionable: true,
      targetId: 'agent_trade_bot',
      targetType: 'agent',
    },
    {
      id: '2',
      message: 'Bot "Strategy Alpha 3" has negative P&L for 3 consecutive days',
      severity: 'warning' as WarningSeverity,
      source: 'bot' as WarningSource,
      timestamp: new Date(Date.now() - 60000 * 60).toISOString(), // 1 hour ago
      actionable: true,
      targetId: 'bot_strategy_a3',
      targetType: 'bot',
    },
    {
      id: '3',
      message: 'Daily backup completed successfully',
      severity: 'info' as WarningSeverity,
      source: 'cron' as WarningSource,
      timestamp: new Date(Date.now() - 60000 * 120).toISOString(), // 2 hours ago
      actionable: false,
      targetId: 'daily_backup',
      targetType: 'cron',
    },
  ]);

  // Determine system statuses based on data
  const getSystemStatuses = useCallback(() => {
    if (!overview) {
      return {
        gateway: 'online' as StatusType,
        api: 'online' as StatusType,
        ui: 'online' as StatusType,
        cron: 'online' as StatusType,
        bots: 'online' as StatusType,
      };
    }

    // Check if any cron jobs failed
    const hasFailedCrons = overview.crons.some(cron => cron.lastResult === 'fail');
    
    // Check if any agents are in error state
    const hasAgentErrors = overview.agents.some(agent => agent.state === 'error');
    
    // Check if any bots have negative P&L
    const hasNegativeBots = overview.bots.some(bot => bot.pnl < 0);

    return {
      gateway: 'online' as StatusType,
      api: 'online' as StatusType,
      ui: 'online' as StatusType,
      cron: hasFailedCrons ? 'warning' as StatusType : 'online' as StatusType,
      bots: hasNegativeBots ? 'warning' as StatusType : 'online' as StatusType,
    };
  }, [overview]);

  const fetchSources = async () => {
    try {
      const sourcesData = await api.sources.getSources();
      setSources(sourcesData);
    } catch (err) {
      console.warn('Failed to fetch sources:', err);
    }
  };

  const fetchOverview = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const overviewData = await api.overview.getOverview();
      setOverview(overviewData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleWarningClick = (warning: Warning) => {
    console.log('Warning clicked:', warning);
    // In a real app, this would navigate to the relevant section
    alert(`Clicked warning: ${warning.message}\nTarget: ${warning.targetType} ${warning.targetId}`);
  };

  useEffect(() => {
    fetchOverview();
    fetchSources();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const Section: React.FC<{ 
    title: string; 
    children: React.ReactNode;
    actions?: React.ReactNode;
  }> = ({ title, children, actions }) => (
    <div style={{ 
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          margin: 0,
          color: '#1f2937'
        }}>
          {title}
        </h2>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );

  if (loading && !overview) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        color: '#6b7280'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '3px solid #e5e7eb', 
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <div>Loading dashboard...</div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
      <TopBar 
        lastUpdated={lastUpdated}
        onRefresh={fetchOverview}
        isRefreshing={isRefreshing}
        statuses={getSystemStatuses()}
      />

      <div style={{ padding: '1.5rem 0' }}>
        {error && (
          <div style={{ 
            color: '#dc2626', 
            padding: '1rem', 
            backgroundColor: '#fee2e2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <WarningsPanel 
          warnings={warnings}
          onWarningClick={handleWarningClick}
          maxHeight="250px"
        />

        {overview && (
          <>
            {/* 3-Column Grid for Desktop */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* On large screens: 3 columns */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                '@media (max-width: 1200px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                },
                '@media (max-width: 768px)': {
                  gridTemplateColumns: '1fr',
                }
              } as any}>
                <Section title={`Agents (${overview.agents.length})`}>
                  <AgentsTable agents={overview.agents} loading={isRefreshing} />
                </Section>
                
                <Section title={`Cron Jobs (${overview.crons.length})`}>
                  <CronsTable crons={overview.crons} loading={isRefreshing} />
                </Section>
                
                <Section title={`Bots (${overview.bots.length})`}>
                  <BotsGrid bots={overview.bots} loading={isRefreshing} />
                </Section>
              </div>
            </div>

            {/* Additional Info Section */}
            <Section title="System Information">
              <ResponsiveGrid minColumnWidth="250px" gap="1rem">
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Server Time</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                    {new Date(overview.serverTime).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Costs Today</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#10b981' }}>
                    ${overview.costsTodayUsd?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Warnings</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 500, color: warnings.length > 0 ? '#f59e0b' : '#10b981' }}>
                    {warnings.length}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Data Sources</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {sources?.dataRoot ? 'Connected' : 'Not available'}
                  </div>
                </div>
              </ResponsiveGrid>
            </Section>

            {/* Sources Section (collapsible) */}
            {sources && (
              <Section 
                title="Data Sources"
                actions={
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Last checked: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                }
              >
                <ResponsiveGrid minColumnWidth="200px" gap="1rem">
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Data Root</div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      backgroundColor: '#f3f4f6',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {sources.dataRoot}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Agents Path</div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      backgroundColor: '#f3f4f6',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {sources.agentsPath}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Crons Path</div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      backgroundColor: '#f3f4f6',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {sources.cronsPath}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Bots Directory</div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      backgroundColor: '#f3f4f6',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {sources.botsPath}
                    </div>
                  </div>
                </ResponsiveGrid>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '1.5rem 0', 
        borderTop: '1px solid #e5e7eb',
        fontSize: '0.875rem', 
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <div>Jarvis Dashboard • Auto-refreshes every 30 seconds • Click "Refresh Now" for immediate update</div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          UI Version: 2.0 • API: {overview ? 'Connected' : 'Disconnected'} • Last fetch: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
        </div>
      </div>
    </div>
  );
};