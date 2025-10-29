import React, { useState } from 'react';
import { Globe, Lock, Key, Eye, EyeOff, Plus, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { ModuleParameter } from '../../types/modules';
import apiExamples from '../../data/api-examples.json';

interface APIConfigurationPanelProps {
  parameters: ModuleParameter[];
  configuration: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

type AuthType = 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';

const APIConfigurationPanel: React.FC<APIConfigurationPanelProps> = ({
  parameters,
  configuration,
  onChange,
  errors = {}
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [responsePreview, setResponsePreview] = useState<any>(null);
  const [selectedExampleId, setSelectedExampleId] = useState<string>('');

  const authType = configuration.auth_type || 'none';
  const method = configuration.method || 'GET';
  const endpoint = configuration.endpoint || '';

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

  const testConnection = async () => {
    if (!endpoint) {
      setConnectionStatus('error');
      setConnectionMessage('Please provide an endpoint URL');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setResponsePreview(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          method,
          auth_type: authType,
          auth_config: getAuthConfig(),
          headers: configuration.headers || {},
          query_params: configuration.query_params || {},
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setConnectionStatus('success');
        setConnectionMessage(`Connected successfully (${result.status_code})`);
        setResponsePreview(result.preview);
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

  const getAuthConfig = () => {
    switch (authType) {
      case 'basic':
        return {
          username: configuration.username,
          password: configuration.password,
        };
      case 'bearer':
        return {
          token: configuration.bearer_token,
        };
      case 'api_key':
        return {
          key: configuration.api_key,
          location: configuration.api_key_location || 'header',
          name: configuration.api_key_name || 'X-API-Key',
        };
      case 'oauth2':
        return {
          client_id: configuration.oauth_client_id,
          client_secret: configuration.oauth_client_secret,
          token_url: configuration.oauth_token_url,
          scope: configuration.oauth_scope,
        };
      default:
        return {};
    }
  };

  const renderEndpointConfiguration = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Endpoint Configuration</h4>
      
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => onChange('method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={endpoint}
              onChange={(e) => onChange('endpoint', e.target.value)}
              placeholder="https://api.example.com/data"
              className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endpoint ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.endpoint && (
            <p className="text-xs text-red-500 mt-1">{errors.endpoint}</p>
          )}
        </div>
      </div>

      {/* Load Example */}
      <div className="mt-3 grid grid-cols-4 gap-2 items-end">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Load Example</label>
          <select
            value={selectedExampleId}
            onChange={(e) => setSelectedExampleId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a public dataset...</option>
            {(apiExamples as any).examples.map((ex: any) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            disabled={!selectedExampleId}
            onClick={() => {
              const ex = (apiExamples as any).examples.find((e: any) => e.id === selectedExampleId);
              if (!ex) return;
              if (ex.method) onChange('method', ex.method);
              if (ex.endpoint) onChange('endpoint', ex.endpoint);
              onChange('auth_type', ex.auth_type || 'none');
              onChange('headers', ex.headers || {});
              onChange('query_params', ex.query_params || {});
              onChange('response_format', ex.response_format || 'json');
              onChange('data_path', ex.data_path || '$');
              if (ex.auth_type === 'api_key') {
                if (ex.api_key_location) onChange('api_key_location', ex.api_key_location);
                if (ex.api_key_name) onChange('api_key_name', ex.api_key_name);
              }
            }}
          >
            Apply Example
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Test your endpoint to verify connectivity and preview response
        </div>
        <button
          type="button"
          onClick={testConnection}
          disabled={testingConnection || !endpoint}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
          {testingConnection ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {connectionStatus !== 'idle' && (
        <div className={`p-3 border rounded-md ${
          connectionStatus === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {connectionStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-2 text-sm ${
              connectionStatus === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {connectionMessage}
            </span>
          </div>
          
          {responsePreview && (
            <div className="mt-3">
              <details>
                <summary className="cursor-pointer text-xs font-medium text-gray-700">
                  Response Preview
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(responsePreview, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAuthenticationConfiguration = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Authentication</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Type</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'none', label: 'None', icon: null },
            { value: 'basic', label: 'Basic Auth', icon: <Lock className="w-4 h-4" /> },
            { value: 'bearer', label: 'Bearer Token', icon: <Key className="w-4 h-4" /> },
            { value: 'api_key', label: 'API Key', icon: <Key className="w-4 h-4" /> },
          ].map(auth => (
            <button
              key={auth.value}
              type="button"
              onClick={() => onChange('auth_type', auth.value)}
              className={`p-3 border-2 rounded-lg text-left transition-colors ${
                authType === auth.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                {auth.icon && <span className="mr-2">{auth.icon}</span>}
                <span className="text-sm font-medium">{auth.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {authType === 'basic' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={configuration.username || ''}
              onChange={(e) => onChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={configuration.password || ''}
                onChange={(e) => onChange('password', e.target.value)}
                className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {authType === 'bearer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bearer Token</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={configuration.bearer_token || ''}
              onChange={(e) => onChange('bearer_token', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {authType === 'api_key' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key Name</label>
              <input
                type="text"
                value={configuration.api_key_name || 'X-API-Key'}
                onChange={(e) => onChange('api_key_name', e.target.value)}
                placeholder="X-API-Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={configuration.api_key_location || 'header'}
                onChange={(e) => onChange('api_key_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="header">Header</option>
                <option value="query">Query Parameter</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key Value</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={configuration.api_key || ''}
                onChange={(e) => onChange('api_key', e.target.value)}
                className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHeadersConfiguration = () => {
    const headers = configuration.headers || {};
    const headerEntries = Object.entries(headers);

    const addHeader = () => {
      const newHeaders = { ...headers, '': '' };
      onChange('headers', newHeaders);
    };

    const updateHeader = (oldKey: string, newKey: string, value: string) => {
      const newHeaders = { ...headers };
      if (oldKey !== newKey && oldKey !== '') {
        delete newHeaders[oldKey];
      }
      if (newKey !== '') {
        newHeaders[newKey] = value;
      }
      onChange('headers', newHeaders);
    };

    const removeHeader = (key: string) => {
      const newHeaders = { ...headers };
      delete newHeaders[key];
      onChange('headers', newHeaders);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Custom Headers</h4>
          <button
            type="button"
            onClick={addHeader}
            className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Header
          </button>
        </div>

        {headerEntries.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No custom headers configured
          </div>
        ) : (
          <div className="space-y-2">
            {headerEntries.map(([key, value], index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, value as string)}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={value as string}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(key)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDataProcessingConfiguration = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Data Processing</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Path (JSONPath)</label>
          <input
            type="text"
            value={configuration.data_path || '$'}
            onChange={(e) => onChange('data_path', e.target.value)}
            placeholder="$.data or $.results"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            JSONPath expression to extract data from response
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
          <select
            value={configuration.response_format || 'json'}
            onChange={(e) => onChange('response_format', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="csv">CSV</option>
            <option value="text">Plain Text</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Request Timeout (seconds)</label>
          <input
            type="number"
            value={configuration.timeout || 30}
            onChange={(e) => onChange('timeout', Number(e.target.value))}
            min="1"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (requests/second)</label>
          <input
            type="number"
            value={configuration.rate_limit || ''}
            onChange={(e) => onChange('rate_limit', e.target.value ? Number(e.target.value) : null)}
            min="1"
            placeholder="No limit"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderEndpointConfiguration()}
      {renderAuthenticationConfiguration()}
      {renderHeadersConfiguration()}
      {renderDataProcessingConfiguration()}
      
      {/* Additional parameters not covered by the specialized UI */}
      {parameters
        .filter(param => ![
          'endpoint', 'method', 'auth_type', 'username', 'password', 'bearer_token', 
          'api_key', 'api_key_name', 'api_key_location', 'headers', 'data_path', 
          'response_format', 'timeout', 'rate_limit'
        ].includes(param.name))
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

export default APIConfigurationPanel;
