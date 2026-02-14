import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Overview } from './pages/Overview';
import { Trading } from './pages/Trading';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <nav style={{ 
          backgroundColor: '#1f2937', 
          padding: '1rem 2rem',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
            Jarvis Dashboard
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#374151'
              }}
            >
              Overview
            </Link>
            <Link 
              to="/trading" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#374151'
              }}
            >
              Trading
            </Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/trading" element={<Trading />} />
        </Routes>
      </div>
    </Router>
  );
};