import React, { useState } from 'react';
import './App.css';
import WorkflowEditor from './components/WorkflowEditor';
import WorkflowDashboard from './components/WorkflowDashboard';
import ModuleManagement from './components/ModuleManagement';
import { Workflow, Settings, Home, List } from 'lucide-react';

type View = 'dashboard' | 'builder' | 'modules';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  const navigation = [
    { key: 'dashboard' as View, label: 'Workflows', icon: List },
    { key: 'modules' as View, label: 'Module Management', icon: Settings }
  ];
  
  const handleCreateNewWorkflow = () => {
    setCurrentWorkflowId(null);
    setCurrentView('builder');
  };
  
  const handleEditWorkflow = (workflowId: string) => {
    setCurrentWorkflowId(workflowId);
    setCurrentView('builder');
  };
  
  const handleBackToDashboard = () => {
    setCurrentWorkflowId(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="App h-screen flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="w-6 h-6 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Data Platform</h1>
          </div>
          <div className="flex space-x-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === item.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'dashboard' && (
          <WorkflowDashboard 
            onCreateNew={handleCreateNewWorkflow}
            onEditWorkflow={handleEditWorkflow}
          />
        )}
        {currentView === 'builder' && (
          <WorkflowEditor 
            workflowId={currentWorkflowId}
            onBack={handleBackToDashboard}
          />
        )}
        {currentView === 'modules' && <ModuleManagement />}
      </div>
    </div>
  );
}

export default App;
