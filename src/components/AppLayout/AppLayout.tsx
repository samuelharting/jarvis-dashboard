import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex'
    }}>
      <Sidebar />
      {/* Offset for sidebar width and use remaining space */}
      <main style={{
        marginLeft: '256px',
        width: 'calc(100% - 256px)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: 'none', // Remove max-width constraint for full usage
          margin: 0, // Remove auto-centering
          padding: '2rem',
          minHeight: '100vh'
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};