import React from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Globe, FileText } from 'lucide-react';
import { NodeData } from '../../types/nodes';

interface SourceNodeProps {
  data: NodeData;
  selected: boolean;
}

const SourceNode: React.FC<SourceNodeProps> = ({ data, selected }) => {
  const getIcon = () => {
    if (!data.config) return <Database className="w-4 h-4" />;
    
    // Check if it's a configured module instance
    if (data.config.moduleId) {
      const moduleType = data.config.type || 'database';
      switch (true) {
        case moduleType.includes('database') || moduleType.includes('sql'):
          return <Database className="w-4 h-4" />;
        case moduleType.includes('api') || moduleType.includes('rest') || moduleType.includes('http'):
          return <Globe className="w-4 h-4" />;
        case moduleType.includes('file') || moduleType.includes('csv') || moduleType.includes('s3'):
          return <FileText className="w-4 h-4" />;
        default:
          return <Database className="w-4 h-4" />;
      }
    }
    
    // Fallback to old logic
    switch (data.config.type) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'api':
        return <Globe className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };
  
  const getConnectionInfo = () => {
    if (!data.config) return 'Not configured';
    
    // If it's a configured module instance, show connection details
    if (data.config.moduleId && data.config.configuration) {
      const config = data.config.configuration;
      
      // Database connection info
      if (config.source_id || config.table_name) {
        return config.table_name ? `Table: ${config.table_name}` : 'Database source';
      }
      
      // API connection info
      if (config.endpoint) {
        try {
          const url = new URL(config.endpoint);
          return `${url.hostname}${url.pathname}`;
        } catch {
          return config.endpoint.substring(0, 30) + (config.endpoint.length > 30 ? '...' : '');
        }
      }
      
      // File connection info
      if (config.file_path) {
        const fileName = config.file_path.split('/').pop() || config.file_path;
        return fileName.length > 25 ? fileName.substring(0, 25) + '...' : fileName;
      }
      
      return 'Configured';
    }
    
    return 'Legacy node';
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-md bg-white border-2 min-w-[180px] max-w-[220px] ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="flex items-center mb-2">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 mr-2">
          {getIcon()}
        </div>
        <div className="ml-2 flex-1">
          <div className="text-sm font-bold text-gray-900 truncate">{data.label}</div>
          <div className="text-xs text-gray-500">Source</div>
        </div>
      </div>
      
      {/* Connection Info */}
      <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded truncate">
        {getConnectionInfo()}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default SourceNode;
