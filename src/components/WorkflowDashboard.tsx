import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import WorkflowCard, { WorkflowMetrics } from './WorkflowCard';
import { mockApi } from '../services/mockApi';
import { Button } from './ui/button';

interface WorkflowDashboardProps {
  onCreateNew: () => void;
  onEditWorkflow: (workflowId: string) => void;
}

const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({
  onCreateNew,
  onEditWorkflow
}) => {
  const [workflows, setWorkflows] = useState<WorkflowMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated_at');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const workflowData = await mockApi.getWorkflows();
      
      // Convert to WorkflowMetrics format and add calculated metrics
      const workflowMetrics: WorkflowMetrics[] = workflowData.map(workflow => {
        const nodeCount = workflow.nodes ? workflow.nodes.length : 0;
        const tableCount = workflow.nodes ? 
          workflow.nodes.filter((node: any) => node.type === 'table').length : 0;
        
        return {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description || '',
          status: workflow.status || 'draft',
          created_at: workflow.created_at,
          updated_at: workflow.updated_at,
          last_execution: workflow.last_execution,
          execution_status: workflow.execution_status || 'pending',
          node_count: nodeCount,
          table_count: tableCount,
          avg_runtime: generateRandomRuntime(),
          success_rate: generateRandomSuccessRate(),
          total_executions: generateRandomExecutions()
        };
      });
      
      setWorkflows(workflowMetrics);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate some mock metrics for demo purposes
  const generateRandomRuntime = () => {
    const minutes = Math.floor(Math.random() * 45) + 1;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}m ${seconds}s`;
  };

  const generateRandomSuccessRate = () => {
    return Math.floor(Math.random() * 20) + 80; // 80-100%
  };

  const generateRandomExecutions = () => {
    return Math.floor(Math.random() * 50) + 1;
  };

  const handleRunWorkflow = async (workflowId: string) => {
    try {
      // Update local state to show running status
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'running' as const } : w
      ));

      const result = await mockApi.executeWorkflow(workflowId);
      
      // Simulate execution time
      setTimeout(() => {
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { 
            ...w, 
            status: result.success ? 'completed' as const : 'failed' as const,
            execution_status: result.success ? 'success' as const : 'failed' as const,
            last_execution: new Date().toISOString(),
            total_executions: (w.total_executions || 0) + 1
          } : w
        ));
      }, 3000);

    } catch (error) {
      console.error('Error running workflow:', error);
      // Revert status on error
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'failed' as const } : w
      ));
    }
  };

  // Filter and sort workflows
  const filteredWorkflows = workflows
    .filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_at':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  // Calculate dashboard statistics
  const stats = {
    total: workflows.length,
    running: workflows.filter(w => w.status === 'running').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    failed: workflows.filter(w => w.status === 'failed').length,
    draft: workflows.filter(w => w.status === 'draft').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading workflows...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">Workflows</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Design, deploy, and monitor your data processing pipelines
              </p>
            </div>
            
            <Button
              onClick={onCreateNew}
              className="px-6 py-3 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Workflow
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Workflows</p>
                  <p className="text-3xl font-bold text-foreground mt-3">{stats.total}</p>
                  <div className="flex items-center mt-3">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12% this month</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Running</p>
                  <p className="text-3xl font-bold text-blue-600 mt-3">{stats.running}</p>
                  <div className="flex items-center mt-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-muted-foreground">Active now</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-3">{stats.completed}</p>
                  <div className="flex items-center mt-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">98.5% success rate</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-3">{stats.failed}</p>
                  <div className="flex items-center mt-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="text-sm text-amber-600 font-medium">Needs attention</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search workflows by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-input bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Filter:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-foreground">
                <span className="font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-medium"
                >
                  <option value="updated_at">Recently Updated</option>
                  <option value="created_at">Recently Created</option>
                  <option value="name">Name</option>
                </select>
              </div>
              
              <button
                onClick={loadWorkflows}
                className="p-3 text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-accent transition-all duration-200 hover:shadow-sm"
                title="Refresh workflows"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Cards */}
        {filteredWorkflows.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center mx-auto mb-8">
              <BarChart3 className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              {searchTerm || statusFilter !== 'all' ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Transform your data with powerful, visual workflows. Get started by creating your first pipeline.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button
                onClick={onCreateNew}
                className="px-6 py-3 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Workflow
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onEdit={onEditWorkflow}
                onRun={handleRunWorkflow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDashboard;
