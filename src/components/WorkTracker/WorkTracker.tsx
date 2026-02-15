import React from 'react';
import { CheckCircle, Clock, PlayCircle } from 'lucide-react';

interface WorkItem {
  id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'completed' | 'todo';
  startedAt?: Date;
  completedAt?: Date;
  estimatedHours: number;
  actualHours?: number;
}

const WorkTracker: React.FC = () => {
  const [workItems] = React.useState<WorkItem[]>([
    {
      id: '1',
      title: 'Add trading UI components',
      description: 'Implement new navigation sections for Ideas and Work Tracker',
      status: 'in-progress',
      startedAt: new Date('2026-02-15'),
      estimatedHours: 2,
      actualHours: 0.5
    },
    {
      id: '2',
      title: 'Setup localStorage for work tracking',
      description: 'Create persistent storage for work items across sessions',
      status: 'todo',
      estimatedHours: 1
    },
    {
      id: '3',
      title: 'Update responsive layout',
      description: 'Fix navbar spacing and mobile layout for new sections',
      status: 'completed',
      startedAt: new Date('2026-02-14'),
      completedAt: new Date('2026-02-15'),
      estimatedHours: 3,
      actualHours: 2.5
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'todo': return <Clock className="w-5 h-5 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'todo': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return '';
    }
  };

  const inProgress = workItems.filter(item => item.status === 'in-progress');
  const completed = workItems.filter(item => item.status === 'completed');
  const todo = workItems.filter(item => item.status === 'todo');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Tracker</h1>
          <p className="text-gray-600">Track what Jarvis is currently working on and what's been completed</p>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{inProgress.length}</div>
            <div className="text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completed.length}</div>
            <div className="text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{todo.length}</div>
            <div className="text-gray-500">To Do</div>
          </div>
        </div>
      </div>

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <PlayCircle className="w-5 h-5 mr-2 text-blue-500" />
            Currently Working On
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {inProgress.map(item => (
              <WorkItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Todo Section */}
      {todo.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            Up Next
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {todo.map(item => (
              <WorkItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Recently Completed
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {completed.map(item => (
              <WorkItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {workItems.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No work items added yet. Add some tasks for Jarvis to track!</p>
        </div>
      )}
    </div>
  );
};

const WorkItemCard: React.FC<{ item: WorkItem }> = ({ item }) => {
  const progress = item.actualHours && item.estimatedHours 
    ? Math.min((item.actualHours / item.estimatedHours) * 100, 100) 
    : 0;

  return (
    <div className={`bg-white rounded-lg shadow-md border p-4 ${item.status === 'in-progress' ? 'border-blue-200' : item.status === 'completed' ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
          item.status === 'completed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {item.status.replace('-', ' ')}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
      
      <div className="space-y-2 text-sm">
        {item.status === 'in-progress' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="text-gray-600 font-medium">
                {item.actualHours?.toFixed(1) || 0}h / {item.estimatedHours}h
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {item.status === 'completed' && item.completedAt && (
          <div className="text-gray-500">
            <span>Completed on {item.completedAt.toLocaleDateString()}</span>
            {item.actualHours && (
              <span> in {item.actualHours}h (estimated: {item.estimatedHours}h)</span>
            )}
          </div>
        )}
        
        {item.status === 'todo' && (
          <div className="text-gray-500">
            Estimated: {item.estimatedHours}h
          </div>
        )}
      </div>
      
      {item.status === 'in-progress' && item.startedAt && (
        <div className="mt-3 text-xs text-gray-400">
          Started: {item.startedAt.toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

WorkItemCard.displayName = 'WorkItemCard';

export default WorkTracker;