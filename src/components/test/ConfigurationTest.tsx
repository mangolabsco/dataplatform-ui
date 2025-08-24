import React, { useState } from 'react';
import ModuleConfigurationForm from '../configuration/ModuleConfigurationForm';
import { ModuleDefinition } from '../../types/modules';

const ConfigurationTest: React.FC = () => {
  // Mock module definition for database module
  const mockDatabaseModule: ModuleDefinition = {
    id: 'database_postgresql_source',
    name: 'PostgreSQL Database Source',
    type: 'source',
    category: 'database',
    description: 'Connect to a PostgreSQL database to extract data',
    parameters: [
      {
        name: 'hostname',
        label: 'Hostname',
        type: 'text',
        required: true,
        placeholder: 'localhost',
        help: 'Database server hostname or IP address'
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: true,
        default: 5432,
        help: 'Database server port number'
      },
      {
        name: 'database_name',
        label: 'Database Name',
        type: 'text',
        required: true,
        help: 'Name of the database to connect to'
      },
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        help: 'Database username'
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        help: 'Database password'
      }
    ]
  };

  // Mock API module definition
  const mockAPIModule: ModuleDefinition = {
    id: 'rest_api_source',
    name: 'REST API Source',
    type: 'source',
    category: 'api',
    description: 'Connect to a REST API endpoint to fetch data',
    parameters: [
      {
        name: 'host',
        label: 'API Host',
        type: 'text',
        required: true,
        placeholder: 'api.example.com',
        help: 'API server hostname'
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: false,
        help: 'API server port (optional)'
      },
      {
        name: 'base_path',
        label: 'Base Path',
        type: 'text',
        required: false,
        placeholder: '/api/v1',
        help: 'Base path for API endpoints'
      }
    ]
  };

  const [selectedModule, setSelectedModule] = useState<'database' | 'api'>('database');
  const [configuration, setConfiguration] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    console.log('ConfigurationTest - onChange called:', { name, value });
    setConfiguration(prev => {
      const newConfig = { ...prev, [name]: value };
      console.log('ConfigurationTest - new configuration:', newConfig);
      return newConfig;
    });

    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const currentModule = selectedModule === 'database' ? mockDatabaseModule : mockAPIModule;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Form Test</h1>
        
        {/* Module Type Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => {
              setSelectedModule('database');
              setConfiguration({});
              setErrors({});
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              selectedModule === 'database'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Database Module
          </button>
          <button
            onClick={() => {
              setSelectedModule('api');
              setConfiguration({});
              setErrors({});
            }}
            className={`px-4 py-2 rounded-md font-medium ${
              selectedModule === 'api'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            API Module
          </button>
        </div>
      </div>

      {/* Configuration State Display */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Configuration State:</h3>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(configuration, null, 2)}
        </pre>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ModuleConfigurationForm
          moduleDefinition={currentModule}
          configuration={configuration}
          onChange={handleChange}
          errors={errors}
        />
      </div>

      {/* Validation Test Button */}
      <div className="mt-6">
        <button
          onClick={() => {
            // Simple validation test
            const newErrors: Record<string, string> = {};
            currentModule.parameters.forEach(param => {
              if (param.required && !configuration[param.name]) {
                newErrors[param.name] = `${param.label} is required`;
              }
            });
            setErrors(newErrors);
            console.log('Validation errors:', newErrors);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Test Validation
        </button>
        
        <button
          onClick={() => {
            setConfiguration({});
            setErrors({});
          }}
          className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ConfigurationTest;
