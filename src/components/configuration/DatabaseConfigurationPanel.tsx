import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ModuleParameter } from '../../types/modules';

interface DatabaseSource {
  id: string;
  name: string;
  type: string; // 'mysql', 'postgresql', 'sqlite', etc.
  host?: string;
  port?: number;
  database?: string;
  status?: 'connected' | 'disconnected' | 'testing';
}

interface DatabaseTable {
  name: string;
  schema?: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primary_key?: boolean;
  }>;
}

interface DatabaseConfigurationPanelProps {
  parameters: ModuleParameter[];
  configuration: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

const DatabaseConfigurationPanel: React.FC<DatabaseConfigurationPanelProps> = ({
  parameters,
  configuration,
  onChange,
  errors = {}
}) => {
  const [sources, setSources] = useState<DatabaseSource[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  const selectedSource = configuration.source_id;
  const selectedTable = configuration.table_name;

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const response = await fetch(`${API_BASE_URL}/database/sources`);
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Failed to fetch database sources:', error);
    } finally {
      setLoadingSources(false);
    }
  };

  const fetchTables = async (sourceId: string) => {
    if (!sourceId) return;
    
    setLoadingTables(true);
    try {
      const response = await fetch(`${API_BASE_URL}/database/sources/${sourceId}/tables`);
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const testConnection = async (sourceId: string) => {
    if (!sourceId) return;
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    try {
      const response = await fetch(`${API_BASE_URL}/database/sources/${sourceId}/test`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setConnectionStatus('success');
        setConnectionMessage('Connection successful');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.message || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Failed to test connection');
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    if (selectedSource) {
      fetchTables(selectedSource);
    } else {
      setTables([]);
      onChange('table_name', '');
    }
  }, [selectedSource]);

  const renderSourceSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Database Source</h4>
        <button
          type="button"
          onClick={fetchSources}
          disabled={loadingSources}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingSources ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loadingSources ? (
          <div className="p-4 text-center text-gray-500">Loading sources...</div>
        ) : sources.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No database sources configured. 
            <a href="/admin/datasources" className="text-blue-600 hover:text-blue-800 ml-1">
              Add one here
            </a>
          </div>
        ) : (
          sources.map(source => (
            <div
              key={source.id}
              onClick={() => onChange('source_id', source.id)}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedSource === source.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-gray-600" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{source.name}</div>
                    <div className="text-xs text-gray-500">
                      {source.type} • {source.host}:{source.port}/{source.database}
                    </div>
                  </div>
                </div>
                {selectedSource === source.id && (
                  <div className="flex items-center space-x-2">
                    {connectionStatus === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {connectionStatus === 'error' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        testConnection(source.id);
                      }}
                      disabled={testingConnection}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {testingConnection ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {connectionStatus === 'error' && connectionMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="ml-2 text-sm text-red-700">{connectionMessage}</span>
          </div>
        </div>
      )}
      
      {errors.source_id && (
        <p className="text-xs text-red-500">{errors.source_id}</p>
      )}
    </div>
  );

  const renderTableSelection = () => {
    if (!selectedSource) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Table Selection</h4>
          <button
            type="button"
            onClick={() => fetchTables(selectedSource)}
            disabled={loadingTables}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTables ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingTables ? (
          <div className="p-4 text-center text-gray-500">Loading tables...</div>
        ) : tables.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No tables found in this database</div>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedTable || ''}
              onChange={(e) => onChange('table_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.table_name ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a table...</option>
              {tables.map(table => (
                <option key={table.name} value={table.name}>
                  {table.schema ? `${table.schema}.${table.name}` : table.name}
                  {' '}({table.columns.length} columns)
                </option>
              ))}
            </select>
            
            {selectedTable && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <h5 className="text-xs font-medium text-gray-900 mb-2">Table Columns:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {tables.find(t => t.name === selectedTable)?.columns.map(col => (
                    <div key={col.name} className="flex items-center justify-between">
                      <span className={col.primary_key ? 'font-medium text-blue-600' : 'text-gray-700'}>
                        {col.name}
                      </span>
                      <span className="text-gray-500">
                        {col.type}{col.primary_key ? ' (PK)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {errors.table_name && (
          <p className="text-xs text-red-500">{errors.table_name}</p>
        )}
      </div>
    );
  };

  const renderQueryConfiguration = () => {
    if (!selectedTable) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Query Configuration</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Query (Optional)
          </label>
          <textarea
            value={configuration.custom_query || ''}
            onChange={(e) => onChange('custom_query', e.target.value)}
            placeholder={`SELECT * FROM ${selectedTable} WHERE ...`}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to select all rows from the table
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size
            </label>
            <input
              type="number"
              value={configuration.batch_size || 1000}
              onChange={(e) => onChange('batch_size', Number(e.target.value))}
              min="1"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Rows
            </label>
            <input
              type="number"
              value={configuration.max_rows || ''}
              onChange={(e) => onChange('max_rows', e.target.value ? Number(e.target.value) : null)}
              min="1"
              placeholder="Unlimited"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSourceSelection()}
      {renderTableSelection()}
      {renderQueryConfiguration()}
      
      {/* Additional parameters not covered by the specialized UI */}
      {parameters
        .filter(param => !['source_id', 'table_name', 'custom_query', 'batch_size', 'max_rows'].includes(param.name))
        .map(param => {
          const value = configuration[param.name] ?? param.default ?? '';
          const error = errors[param.name];
          
          return (
            <div key={param.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {param.label} {param.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={param.type === 'password' ? 'password' : 'text'}
                value={value}
                onChange={(e) => onChange(param.name, e.target.value)}
                placeholder={param.placeholder}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {param.help && (
                <p className="text-xs text-gray-500 mt-1">{param.help}</p>
              )}
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default DatabaseConfigurationPanel;
