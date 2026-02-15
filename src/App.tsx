import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout/AppLayout';
import { Overview } from './pages/Overview';
import { Bots } from './pages/Bots';
import { Agents } from './pages/Agents';
import { Cron } from './pages/Cron';
import { Trading } from './pages/Trading';
import Ideas from './components/Ideas/Ideas';
import WorkTracker from './components/WorkTracker/WorkTracker';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#FFFFFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
      }}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="bots" element={<Bots />} />
            <Route path="agents" element={<Agents />} />
            <Route path="cron" element={<Cron />} />
            <Route path="trading" element={<Trading />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="work-tracker" element={<WorkTracker />} />
            <Route path="*" element={<div style={{textAlign: 'center', padding: '4rem', color: '#666666'}}><h1>404</h1></div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;