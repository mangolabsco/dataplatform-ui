import React from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  GitBranch, 
  Database,
  MoreVertical,
  Edit3
} from 'lucide-react';

export interface WorkflowMetrics {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  created_at: string;
  updated_at: string;
  last_execution?: string;
  execution_status: 'pending' | 'running' | 'success' | 'failed';
  node_count?: number;
  table_count?: number;
  avg_runtime?: string;
  success_rate?: number;
  total_executions?: number;
}

interface WorkflowCardProps {
  workflow: WorkflowMetrics;
  onEdit: (workflowId: string) => void;
  onRun: (workflowId: string) => void;
  onDelete?: (workflowId: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onEdit,
  onRun,
  onDelete
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'draft':
      default:
        return <Edit3 className="w-4 h-4" />;
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastExecution = (dateString?: string) => {
    if (!dateString) return 'Never run';
    
    const now = new Date();
    const execDate = new Date(dateString);
    const diffInHours = (now.getTime() - execDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const canRun = workflow.status !== 'running';

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-4">
              <h3 className="text-xl font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                {workflow.name}
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(workflow.status)}`}>
                {getStatusIcon(workflow.status)}
                <span className="ml-1.5">{workflow.status}</span>
              </div>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {workflow.description || 'No description provided'}
            </p>
          </div>
          
          {/* Actions Menu */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(workflow.id)}
              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all duration-200"
              title="Edit workflow"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <GitBranch className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nodes</span>
            </div>
            <span className="text-lg font-bold text-foreground">{workflow.node_count || 0}</span>
          </div>
          
          <div className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tables</span>
            </div>
            <span className="text-lg font-bold text-foreground">{workflow.table_count || 0}</span>
          </div>
          
          <div className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Runtime</span>
            </div>
            <span className="text-lg font-bold text-foreground">{workflow.avg_runtime || 'N/A'}</span>
          </div>
          
          <div className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Success</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              {workflow.success_rate ? `${workflow.success_rate}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-muted border-t border-border rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">Created {formatDate(workflow.created_at)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                workflow.execution_status === 'success' ? 'bg-green-400' :
                workflow.execution_status === 'failed' ? 'bg-red-400' :
                workflow.execution_status === 'running' ? 'bg-blue-400 animate-pulse' :
                'bg-gray-400'
              }`} />
              <span className={`font-medium ${getExecutionStatusColor(workflow.execution_status)}`}>
                {formatLastExecution(workflow.last_execution)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full font-medium">
              {workflow.total_executions || 0} runs
            </div>
            
            <button
              onClick={() => onRun(workflow.id)}
              disabled={!canRun}
              className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                canRun
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {workflow.status === 'running' ? (
                <>
                  <div className="w-3 h-3 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Running
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-2" />
                  Run
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
