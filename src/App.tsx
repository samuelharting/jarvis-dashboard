import React from 'react';
import { Overview } from './pages/Overview';

export const App: React.FC = () => {
  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Overview />
    </div>
  );
};