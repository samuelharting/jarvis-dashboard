import React from 'react';
import { Lightbulb } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdAt: Date;
}

const Ideas: React.FC = () => {
  // Mock data for demonstration - in real use, this would be populated by Jarvis
  const [ideas] = React.useState<Idea[]>([
    {
      id: '1',
      title: 'Add real-time trade alerts',
      description: 'Create websocket connection for live price alerts and automated trading signals',
      priority: 'high',
      category: 'Trading',
      createdAt: new Date('2026-02-14')
    },
    {
      id: '2',
      title: 'Enhance bot status dashboard',
      description: 'Add historical performance metrics and machine learning predictions',
      priority: 'medium',
      category: 'Dashboard',
      createdAt: new Date('2026-02-13')
    },
    {
      id: '3',
      title: 'Implement voice commands',
      description: 'Enable voice control for common dashboard operations using Web Speech API',
      priority: 'low',
      category: 'Core',
      createdAt: new Date('2026-02-12')
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Jarvis Ideas</h1>
        </div>
        <span className="text-sm text-gray-500">
          {ideas.length} new idea{ideas.length !== 1 ? 's' : ''} waiting for implementation
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(idea.priority)}`}
              >
                {idea.priority}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{idea.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {idea.category}
              </span>
              <span className="text-xs text-gray-400">
                {idea.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {ideas.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No new ideas yet. Jarvis is thinking...</p>
        </div>
      )}
    </div>
  );
};

export default Ideas;