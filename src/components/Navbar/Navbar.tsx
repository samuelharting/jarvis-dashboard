import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 1rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Brand */}
        <div style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          Jarvis Dashboard
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <NavLink
            to="/overview"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Overview
          </NavLink>
          <NavLink
            to="/bots"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Bots
          </NavLink>
          <NavLink
            to="/agents"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Agents
          </NavLink>
          <NavLink
            to="/cron"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Cron
          </NavLink>
          <NavLink
            to="/trading"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Trading
          </NavLink>
          <NavLink
            to="/ideas"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Ideas
          </NavLink>
          <NavLink
            to="/work-tracker"
            style={({ isActive }) => ({
              color: isActive ? '#1d4ed8' : '#6b7280',
              textDecoration: isActive ? 'none' : 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontWeight: isActive ? '500' : '400',
              borderBottom: isActive ? '2px solid #1d4ed8' : 'none',
              marginBottom: isActive ? '-2px' : '0'
            })}
          >
            Work Tracker
          </NavLink>
        </div>
      </div>
    </nav>
  );
};