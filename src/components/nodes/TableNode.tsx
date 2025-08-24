import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Clock, HardDrive } from 'lucide-react';
import { NodeData } from '../../types/nodes';

interface TableNodeProps {
  data: NodeData;
  selected?: boolean;
}

const TableNode: React.FC<TableNodeProps> = ({ data, selected }) => {
  const config = data.config || {};
  const storageType = config.storageType || 'temporary';
  const tableName = config.tableName || 'untitled_table';
  const retention = config.retention;
  
  const getStorageIcon = () => {
    return storageType === 'persistent' ? (
      <HardDrive className="w-4 h-4" />
    ) : (
      <Clock className="w-4 h-4" />
    );
  };

  const getStorageColor = () => {
    return storageType === 'persistent' 
      ? 'border-purple-300 bg-purple-50' 
      : 'border-orange-300 bg-orange-50';
  };

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg border-2 min-w-[180px] ${
      selected ? 'ring-2 ring-blue-500' : ''
    } ${getStorageColor()}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-purple-600" />
          {getStorageIcon()}
        </div>
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
          storageType === 'persistent'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {storageType}
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {data.label}
        </div>
        <div className="text-xs text-gray-600 mb-2">
          Table: {tableName}
        </div>
        
        {/* Additional Info */}
        <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
          {config.schema && (
            <span>{Object.keys(config.schema).length} columns</span>
          )}
          {retention && (
            <span>TTL: {retention}</span>
          )}
        </div>
        
        {/* Storage description */}
        <div className="text-xs text-gray-400 mt-1">
          {storageType === 'persistent' 
            ? 'Stored in database' 
            : 'Temporary storage'
          }
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

export default memo(TableNode);
