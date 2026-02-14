import React from 'react';
import { Overview } from './pages/Overview';

export const App: React.FC = () => {
  return (
    <div className="App">
      <header style={{ background: '#1e1e1e', color: 'white', padding: '1rem' }}>
        <h1>Jarvis Dashboard</h1>
      </header>
      <main style={{ padding: '2rem' }}>
        <Overview />
      </main>
    </div>
  );
};