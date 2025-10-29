import React, { useState } from 'react';
import { Database, Globe, Eye, EyeOff, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';
import { ModuleDefinition } from '../../types/modules';
import { mockApi } from '../../services/mockApi';
import apiExamples from '../../data/api-examples.json';

interface TypeSpecificConfigurationFormProps {
  moduleDefinition: ModuleDefinition;
  configuration: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

const TypeSpecificConfigurationForm: React.FC<TypeSpecificConfigurationFormProps> = ({
  moduleDefinition,
  configuration,
  onChange,
  errors = {}
}) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      let endpoint = '';
      let payload = {};

      // Determine test endpoint and payload based on module type
      const moduleId = moduleDefinition.id.toLowerCase();
      
      if (moduleId.includes('database') || moduleId.includes('sql')) {
        endpoint = '/database/test-connection';
        payload = {
          host: configuration.hostname,
          port: configuration.port,
          username: configuration.username,
          password: configuration.password,
          database: configuration.database_name,
          type: configuration.database_type || 'postgresql'
        };
      } else if (moduleId.includes('api') || moduleId.includes('rest')) {
        endpoint = '/api/test-connection';
        const baseUrl = `${configuration.protocol || 'https'}://${configuration.host}${configuration.port ? ':' + configuration.port : ''}`;
        const constructedUrl = configuration.base_path ? `${baseUrl}${configuration.base_path}` : baseUrl;
        const endpointUrl = configuration.endpoint || constructedUrl;
        const methodToUse = configuration.method || 'GET';
        
        payload = {
          url: endpointUrl,
          method: methodToUse,
          timeout: 10000
        };
      }

      const result = await mockApi.testConnection(endpoint, payload);

      if (result.success) {
        setConnectionStatus('success');
        setConnectionMessage(result.message);
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.message);
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Failed to test connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const renderDatabaseConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Database className="w-5 h-5 text-green-600 mr-2" />
        <h4 className="text-lg font-medium text-gray-900">Database Connection Settings</h4>
      </div>

      {/* Database Type - Full Width */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Database Type <span className="text-red-500">*</span>
        </label>
        <select
          value={configuration.database_type || ''}
          onChange={(e) => onChange('database_type', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.database_type ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <option value="">Select database type...</option>
          <option value="postgresql">🐘 PostgreSQL</option>
          <option value="mysql">🐬 MySQL</option>
          <option value="mariadb">🦭 MariaDB</option>
          <option value="sqlite">📦 SQLite</option>
          <option value="oracle">🔶 Oracle Database</option>
          <option value="mssql">🏢 Microsoft SQL Server</option>
        </select>
        {errors.database_type && (
          <p className="text-xs text-red-500 mt-2 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
            {errors.database_type}
          </p>
        )}
      </div>

      {/* Connection Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hostname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={configuration.hostname || ''}
            onChange={(e) => onChange('hostname', e.target.value)}
            placeholder="localhost or database.example.com"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.hostname ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.hostname && (
            <p className="text-xs text-red-500 mt-2 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.hostname}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Server hostname or IP address
          </p>
        </div>

        {/* Port */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={configuration.port || ''}
            onChange={(e) => onChange('port', Number(e.target.value))}
            placeholder="5432"
            min="1"
            max="65535"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.port ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            PostgreSQL: 5432, MySQL: 3306, SQL Server: 1433
          </p>
          {errors.port && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.port}
            </p>
          )}
        </div>

        {/* Database Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={configuration.database_name || ''}
            onChange={(e) => onChange('database_name', e.target.value)}
            placeholder="my_database"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.database_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.database_name && (
            <p className="text-xs text-red-500 mt-2 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.database_name}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Name of the target database
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={configuration.username || ''}
            onChange={(e) => onChange('username', e.target.value)}
            placeholder="database_user"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.username && (
            <p className="text-xs text-red-500 mt-2 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.username}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Database authentication username
          </p>
        </div>
      </div>

      {/* Password - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.password ? 'text' : 'password'}
            value={configuration.password || ''}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Enter password"
            className={`w-full px-4 pr-12 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('password')}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-2 flex items-center">
            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
            {errors.password}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Database authentication password
        </p>
      </div>

      {/* SSL Configuration */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuration.ssl_enabled || false}
                onChange={(e) => onChange('ssl_enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Enable SSL/TLS Connection</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recommended for production databases and secure connections
                </p>
              </div>
            </label>
          </div>
          <div className="ml-4">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              configuration.ssl_enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {configuration.ssl_enabled ? '🔒 Secure' : '🔓 Not Secure'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPIConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Globe className="w-5 h-5 text-blue-600 mr-2" />
        <h4 className="text-lg font-medium text-gray-900">API Connection Settings</h4>
      </div>

      {/* Protocol Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Protocol</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChange('protocol', 'https')}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              (configuration.protocol || 'https') === 'https'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              🔒
            </div>
            <div>HTTPS</div>
            <div className="text-xs text-gray-500 mt-1">Recommended & Secure</div>
          </button>
          <button
            type="button"
            onClick={() => onChange('protocol', 'http')}
            className={`p-4 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              configuration.protocol === 'http'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              🔓
            </div>
            <div>HTTP</div>
            <div className="text-xs text-gray-500 mt-1">Not Secure</div>
          </button>
        </div>
      </div>

      {/* Connection Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Host */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Host <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={configuration.host || ''}
            onChange={(e) => onChange('host', e.target.value)}
            placeholder="api.example.com"
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.host ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Domain name or IP address (without protocol)
          </p>
          {errors.host && (
            <p className="text-xs text-red-500 mt-2 flex items-center">
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {errors.host}
            </p>
          )}
        </div>

        {/* Port */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            value={configuration.port || ''}
            onChange={(e) => onChange('port', e.target.value ? Number(e.target.value) : '')}
            placeholder="443 (HTTPS) or 80 (HTTP)"
            min="1"
            max="65535"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use default port
          </p>
        </div>
      </div>

      {/* Base API Path - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base API Path <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="text"
          value={configuration.base_path || ''}
          onChange={(e) => onChange('base_path', e.target.value)}
          placeholder="/api/v1 or /api"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">
          Common base path for all API endpoints (e.g., /api/v1, /rest)
        </p>
      </div>

      {/* URL Preview */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">URL Preview</label>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            configuration.host 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {configuration.host ? '✅ Valid URL' : '⚠️ Enter Host'}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-3">
          <code className="text-sm text-gray-800 font-mono break-all">
            {configuration.host ? (
              `${configuration.protocol || 'https'}://${configuration.host}${
                configuration.port ? ':' + configuration.port : ''
              }${configuration.base_path || ''}`
            ) : (
              <span className="text-gray-400">Enter host to see URL preview</span>
            )}
          </code>
        </div>
      </div>

      {/* Example APIs - Quick presets using public datasets */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-900">Example APIs</h5>
          <span className="text-xs text-gray-500">Load presets from public datasets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(apiExamples as any).examples.map((ex: any) => (
            <div key={ex.id} className="border border-gray-200 rounded-md p-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{ex.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{ex.protocol || 'https'}://{ex.host}{ex.base_path || ''}</div>
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {ex.auth_type && ex.auth_type !== 'none' ? ex.auth_type : 'no auth'}
                </div>
              </div>
              {ex.endpoint && (
                <div className="mt-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">Sample endpoint</div>
                  <div className="text-xs font-mono text-gray-700 break-all">
                    {ex.endpoint}
                  </div>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => {
                    onChange('protocol', ex.protocol || 'https');
                    onChange('host', ex.host || '');
                    onChange('port', ex.port || '');
                    onChange('base_path', ex.base_path || '');
                  }}
                >
                  Apply host + base path
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    // Apply full endpoint and common API options if present
                    if (ex.method) onChange('method', ex.method);
                    if (ex.endpoint) onChange('endpoint', ex.endpoint);
                    onChange('auth_type', ex.auth_type || 'none');
                    if (ex.headers) onChange('headers', ex.headers);
                    if (ex.query_params) onChange('query_params', ex.query_params);
                    if (ex.response_format) onChange('response_format', ex.response_format);
                    if (ex.data_path) onChange('data_path', ex.data_path);
                    if (ex.rate_limit !== undefined) onChange('rate_limit', ex.rate_limit);
                    if (ex.auth_type === 'api_key') {
                      if (ex.api_key_location) onChange('api_key_location', ex.api_key_location);
                      if (ex.api_key_name) onChange('api_key_name', ex.api_key_name);
                      // Do NOT set actual api_key value; keep it empty or templated
                    }
                  }}
                >
                  Apply full endpoint
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getModuleTypeFromId = () => {
    const moduleId = moduleDefinition.id.toLowerCase();
    
    if (moduleId.includes('database') || moduleId.includes('sql')) {
      return 'database';
    } else if (moduleId.includes('api') || moduleId.includes('rest')) {
      return 'api';
    }
    
    return 'generic';
  };

  const moduleType = getModuleTypeFromId();

  return (
    <div className="space-y-6">
      {/* Module Information Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            {moduleType === 'database' ? (
              <Database className="w-6 h-6 text-blue-600" />
            ) : moduleType === 'api' ? (
              <Globe className="w-6 h-6 text-blue-600" />
            ) : (
              <Settings className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-1">{moduleDefinition.name}</h3>
            <p className="text-sm text-blue-700">{moduleDefinition.description}</p>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6">
          {moduleType === 'database' && renderDatabaseConfiguration()}
          {moduleType === 'api' && renderAPIConfiguration()}
          
          {/* Generic configuration for other modules */}
          {moduleType === 'generic' && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">Configuration Parameters</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduleDefinition.parameters.map(param => {
                  const value = configuration[param.name] ?? param.default ?? '';
                  const error = errors[param.name];
                  
                  return (
                    <div key={param.name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {param.label} {param.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={param.type === 'password' ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => onChange(param.name, e.target.value)}
                        placeholder={param.placeholder}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {param.help && (
                        <p className="text-xs text-gray-500">{param.help}</p>
                      )}
                      {error && (
                        <p className="text-xs text-red-500">{error}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Connection Test Section */}
        {(moduleType === 'database' || moduleType === 'api') && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 text-gray-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">Connection Test</h4>
              </div>
              <button
                type="button"
                onClick={testConnection}
                disabled={testingConnection}
                className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
                {testingConnection ? 'Testing Connection...' : 'Test Connection'}
              </button>
            </div>

            {connectionStatus !== 'idle' && (
              <div className={`p-3 border rounded-md transition-all ${
                connectionStatus === 'success' 
                  ? 'bg-green-50 border-green-200 shadow-sm' 
                  : 'bg-red-50 border-red-200 shadow-sm'
              }`}>
                <div className="flex items-center">
                  {connectionStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`ml-3 text-sm font-medium ${
                    connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionMessage}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeSpecificConfigurationForm;
