import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

interface SidebarSection {
  title: string;
  items: {
    name: string;
    path: string;
    icon?: string;
  }[];
}

const sections: SidebarSection[] = [
  {
    title: "System",
    items: [
      { name: "Overview", path: "/overview", icon: "📊" },
    ]
  },
  {
    title: "Trading Fleets",
    items: [
      { name: "Bots", path: "/bots", icon: "🤖" },
      { name: "Trading", path: "/trading", icon: "📈" },
    ]
  },
  {
    title: "Monitoring",
    items: [
      { name: "Agents", path: "/agents", icon: "👥" },
      { name: "Cron Jobs", path: "/cron", icon: "⏰" },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      className="sidebar"
      style={{
        width: '256px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
        position: 'fixed',
        left: 0,
        top: 0,
        boxShadow: '4px 0 20px rgba(12, 45, 98, 0.3)',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(96, 165, 250, 0.2)',
        visibility: 'visible'
      }}
    >
      {/* Jarvis Brand */}
      <div 
        className="brand"
        style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
          background: 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#87CEEB',
          letterSpacing: '0.05em',
          textShadow: '0 0 20px rgba(135, 206, 235, 0.8)',
          userSelect: 'none'
        }}>
          JARVIS
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#BFE3FF',
          marginTop: '0.25rem',
          fontWeight: '500'
        }}>
          Dashboard
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ padding: '1rem 0', overflowY: 'auto' }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              padding: '0 1.5rem 0.75rem 1.5rem',
              margin: 0,
              color: '#87CEEB',
              fontSize: '0.875rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {section.title}
            </h3>
            
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? '#FFFFFF' : '#E6F3FF',
                  backgroundColor: isActive ? 'rgba(135, 206, 235, 0.3)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  borderLeft: isActive ? '4px solid #87CEEB' : '4px solid transparent',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: isActive ? '600' : '500',
                  letterSpacing: '0.025em'
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ marginRight: '0.75rem', fontSize: '1.125rem', filter: 'drop-shadow(0 0 1px rgba(255,200,255,0.3))' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', fontFamily: 'system-ui' }}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.1), transparent)',
                        pointerEvents: 'none'
                      }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* System Status */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(96, 165, 250, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#60a5fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ color: '#00FF8C', fontSize: '0.75rem', filter: 'drop-shadow(0 0 2px #00FF8C)' }}>●</span>
            <span style={{ color: '#F1F5F9', fontSize: '0.875rem', fontWeight: '500' }}>System Online</span>
          </div>
          <div style={{ color: '#BFE3FF', marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: '400' }}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};