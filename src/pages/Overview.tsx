import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface SystemStats {
  totalBots: number;
  totalAgents: number;
  totalCrons: number;
  warnings: string[];
  costsTodayUsd: number | null;
  serverTime: string;
}

export const Overview: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalBots: 0,
    totalAgents: 0,
    totalCrons: 0,
    warnings: [],
    costsTodayUsd: null,
    serverTime: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30-second real-time refresh
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await api.overview.getOverview();
      if (response.ok) {
        setStats({
          totalBots: response.bots?.length || 0,
          totalAgents: response.agents?.length || 0,
          totalCrons: response.crons?.length || 0,
          warnings: response.warnings || [],
          costsTodayUsd: response.costsTodayUsd,
          serverTime: response.serverTime || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading overview:', error);
      setStats(prev => ({ 
        ...prev, 
        warnings: ['Failed to load system data']
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    if (amount === 0) return '$0.00';
    return amount >= 0 ? `$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div style={{ color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #111111 0%, #0a0a0a 100%)',
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
          System Overview
        </h1>
        <p style={{ color: '#BFE3FF', fontSize: '1.125rem', fontWeight: 400 }}>
          Connected to {stats.serverTime ? new Date(stats.serverTime).toLocaleString() : 'system'}
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <Link to="/bots" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: '#0a0a0a',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            cursor: 'pointer',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            boxShadow: '0 4px 16px rgba(12, 45, 98, 0.2)',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <div style={{
              color: '#60a5fa',
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              💰
            </div>
            <div style={{ color: '#60a5fa', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {loading ? '🔄' : stats.totalBots}
            </div>
            <div style={{ color: '#94a3b8' }}>Trading Bots</div>
          </div>
        </Link>

        <Link to="/agents" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(22, 101, 52, 0.3) 0%, rgba(6, 78, 59, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            cursor: 'pointer',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            boxShadow: '0 4px 16px rgba(6, 78, 59, 0.2)',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <div style={{
              color: '#22c55e',
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              🤖
            </div>
            <div style={{ color: '#22c55e', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {loading ? '🔄' : stats.totalAgents}
            </div>
            <div style={{ color: '#94a3b8' }}>AI Agents</div>
          </div>
        </Link>

        <Link to="/cron" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.3) 0%, rgba(133, 77, 14, 0.2) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            cursor: 'pointer',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            boxShadow: '0 4px 16px rgba(133, 77, 14, 0.2)',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <div style={{
              color: '#f59e0b',
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              ⏰
            </div>
            <div style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {loading ? '🔄' : stats.totalCrons}
            </div>
            <div style={{ color: '#94a3b8' }}>Scheduled Jobs</div>
          </div>
        </Link>

        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(153, 27, 27, 0.2) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          boxShadow: '0 4px 16px rgba(153, 27, 27, 0.2)'
        }}>
          <div style={{
            color: '#ef4444',
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            💰
          </div>
          <div style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            {loading ? '🔄' : formatCurrency(stats.costsTodayUsd)}
          </div>
          <div style={{ color: '#94a3b8' }}>Daily Costs</div>
        </div>
      </div>

      {/* Dashboard Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        {[
          { title: 'Trading Fleets', description: 'Monitor real-time bot performance', path: '/bots', icon: '📈' },
          { title: 'Trading Competition', description: 'Multi-fleet tournament results', path: '/trading', icon: '🏆' },
          { title: 'Agent Management', description: 'AI agent orchestration', path: '/agents', icon: '👥' },
          { title: 'System Health', description: 'Cron job monitoring', path: '/cron', icon: '✅' }
        ].map(item => (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(12, 45, 98, 0.2) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(96, 165, 250, 0.15)',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(96, 165, 250, 0.3)' }
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                {item.icon}
              </div>
              <div style={{
                color: '#60a5fa',
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {item.title}
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                lineHeight: '1.4'
              }}>
                {item.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Warnings Panel */}
      {stats.warnings.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.2) 0%, rgba(30, 64, 175, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginTop: '2rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: '0 4px 16px rgba(185, 28, 28, 0.1)'
        }}>
          <div style={{ color: '#f87171', fontWeight: '600', marginBottom: '0.5rem' }}>
            System Warnings
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {stats.warnings.map((warning, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>• {warning}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};