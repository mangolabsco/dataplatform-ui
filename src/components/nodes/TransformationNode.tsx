import React from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Filter, BarChart3, ArrowUpDown, Calculator } from 'lucide-react';
import { NodeData } from '../../types/nodes';

interface TransformationNodeProps {
  data: NodeData;
  selected: boolean;
}

const TransformationNode: React.FC<TransformationNodeProps> = ({ data, selected }) => {
  const getIcon = () => {
    if (!data.config) return <Settings className="w-4 h-4" />;
    
    // Check if it's a configured module instance
    if (data.config.moduleId) {
      const moduleType = data.config.type || 'transformation';
      switch (true) {
        case moduleType.includes('filter'):
          return <Filter className="w-4 h-4" />;
        case moduleType.includes('aggregate') || moduleType.includes('group'):
          return <BarChart3 className="w-4 h-4" />;
        case moduleType.includes('map') || moduleType.includes('transform'):
          return <ArrowUpDown className="w-4 h-4" />;
        case moduleType.includes('calculate') || moduleType.includes('compute'):
          return <Calculator className="w-4 h-4" />;
        default:
          return <Settings className="w-4 h-4" />;
      }
    }
    
    // Fallback to old logic
    switch (data.config.type) {
      case 'filter':
        return <Filter className="w-4 h-4" />;
      case 'aggregate':
        return <BarChart3 className="w-4 h-4" />;
      case 'map':
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };
  
  const getTransformationInfo = () => {
    if (!data.config) return 'Not configured';
    
    // If it's a configured module instance, show transformation details
    if (data.config.moduleId && data.config.configuration) {
      const config = data.config.configuration;
      
      // Show operation type or description
      if (config.operation) {
        return `Op: ${config.operation}`;
      }
      
      if (config.sql_query) {
        return 'SQL Transform';
      }
      
      if (config.expression) {
        return 'Expression';
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
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 mr-2">
          {getIcon()}
        </div>
        <div className="ml-2 flex-1">
          <div className="text-sm font-bold text-gray-900 truncate">{data.label}</div>
          <div className="text-xs text-gray-500">Transformation</div>
        </div>
      </div>
      
      {/* Transformation Info */}
      <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded truncate">
        {getTransformationInfo()}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default TransformationNode;
