import React from 'react';
import { Settings } from 'lucide-react';
import { ModuleDefinition, ModuleParameter } from '../../types/modules';
import DatabaseConfigurationPanel from './DatabaseConfigurationPanel';
import APIConfigurationPanel from './APIConfigurationPanel';
import FileConfigurationPanel from './FileConfigurationPanel';
import TypeSpecificConfigurationForm from './TypeSpecificConfigurationForm';

interface ModuleConfigurationFormProps {
  moduleDefinition: ModuleDefinition;
  configuration: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

const ModuleConfigurationForm: React.FC<ModuleConfigurationFormProps> = ({
  moduleDefinition,
  configuration,
  onChange,
  errors = {}
}) => {
  // Determine which specialized panel to use based on module type/id
  const getConfigurationPanel = () => {
    const moduleId = moduleDefinition.id.toLowerCase();
    const moduleType = moduleDefinition.type.toLowerCase();
    
    // Database modules - use TypeSpecificConfigurationForm
    if (moduleId.includes('database') || 
        moduleId.includes('mysql') || 
        moduleId.includes('postgresql') || 
        moduleId.includes('sqlite') ||
        moduleId.includes('sql_server') ||
        moduleType.includes('database')) {
      return (
        <TypeSpecificConfigurationForm
          moduleDefinition={moduleDefinition}
          configuration={configuration}
          onChange={onChange}
          errors={errors}
        />
      );
    }
    
    // API modules - use TypeSpecificConfigurationForm
    if (moduleId.includes('api') || 
        moduleId.includes('rest') || 
        moduleId.includes('http') ||
        moduleId.includes('webhook') ||
        moduleType.includes('api')) {
      return (
        <TypeSpecificConfigurationForm
          moduleDefinition={moduleDefinition}
          configuration={configuration}
          onChange={onChange}
          errors={errors}
        />
      );
    }
    
    // File modules
    if (moduleId.includes('file') || 
        moduleId.includes('csv') || 
        moduleId.includes('json') ||
        moduleId.includes('excel') ||
        moduleId.includes('s3') ||
        moduleId.includes('ftp') ||
        moduleType.includes('file')) {
      return (
        <FileConfigurationPanel
          parameters={moduleDefinition.parameters}
          configuration={configuration}
          onChange={onChange}
          errors={errors}
        />
      );
    }
    
    // Default generic form for other modules
    return renderGenericConfiguration();
  };

  const renderGenericConfiguration = () => {
    // Group parameters by their group property
    const groupedParameters = moduleDefinition.parameters.reduce((groups, param) => {
      const group = param.group || 'General';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(param);
      return groups;
    }, {} as Record<string, ModuleParameter[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedParameters).map(([groupName, parameters]) => (
          <div key={groupName} className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">{groupName}</h4>
            <div className="space-y-4">
              {parameters.map(param => renderParameter(param))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderParameter = (param: ModuleParameter) => {
    const value = configuration[param.name] ?? param.default ?? '';
    const error = errors[param.name];

    const baseClasses = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const errorClasses = error ? "border-red-300" : "border-gray-300";

    switch (param.type) {
      case 'text':
      case 'password':
        return (
          <div key={param.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={param.type}
              value={value}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={param.placeholder}
              className={`${baseClasses} ${errorClasses}`}
            />
            {param.help && (
              <p className="text-xs text-gray-500 mt-1">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={param.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(param.name, Number(e.target.value))}
              placeholder={param.placeholder}
              min={param.validation?.min}
              max={param.validation?.max}
              className={`${baseClasses} ${errorClasses}`}
            />
            {param.help && (
              <p className="text-xs text-gray-500 mt-1">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={param.name} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => onChange(param.name, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {param.label} {param.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {param.help && (
              <p className="text-xs text-gray-500 mt-1 ml-6">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1 ml-6">{error}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={param.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => onChange(param.name, e.target.value)}
              className={`${baseClasses} ${errorClasses}`}
            >
              <option value="">Select...</option>
              {param.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {param.help && (
              <p className="text-xs text-gray-500 mt-1">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        );

      case 'multi_select':
        return (
          <div key={param.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                onChange(param.name, selectedValues);
              }}
              className={`${baseClasses} ${errorClasses}`}
              size={Math.min(param.options?.length || 5, 5)}
            >
              {param.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {param.help && (
              <p className="text-xs text-gray-500 mt-1">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={param.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={param.placeholder}
              rows={3}
              className={`${baseClasses} ${errorClasses} resize-none`}
            />
            {param.help && (
              <p className="text-xs text-gray-500 mt-1">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        );

      case 'json':
        return (
          <div key={param.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label} {param.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(param.name, parsed);
                } catch {
                  onChange(param.name, e.target.value);
                }
              }}
              placeholder={param.placeholder || '{}'}
              rows={5}
              className={`${baseClasses} ${errorClasses} resize-none font-mono text-xs`}
            />
            {param.help && (
              <p className="text-xs text-gray-500 mt-1">{param.help}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>
        );

      case 'key_value':
        return renderKeyValueParameter(param, value, error);

      default:
        return null;
    }
  };

  const renderKeyValueParameter = (param: ModuleParameter, value: any, error?: string) => {
    const keyValuePairs = value || {};
    const entries = Object.entries(keyValuePairs);

    const addPair = () => {
      onChange(param.name, { ...keyValuePairs, '': '' });
    };

    const updatePair = (oldKey: string, newKey: string, newValue: string) => {
      const newPairs = { ...keyValuePairs };
      if (oldKey !== newKey && oldKey !== '') {
        delete newPairs[oldKey];
      }
      if (newKey !== '') {
        newPairs[newKey] = newValue;
      }
      onChange(param.name, newPairs);
    };

    const removePair = (key: string) => {
      const newPairs = { ...keyValuePairs };
      delete newPairs[key];
      onChange(param.name, newPairs);
    };

    return (
      <div key={param.name} className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {param.label} {param.required && <span className="text-red-500">*</span>}
          </label>
          <button
            type="button"
            onClick={addPair}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Add Pair
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4 border border-gray-200 rounded">
            No key-value pairs configured
          </div>
        ) : (
          <div className="space-y-2 border border-gray-200 rounded p-3">
            {entries.map(([key, val], index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => updatePair(key, e.target.value, val as string)}
                  placeholder="Key"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  value={val as string}
                  onChange={(e) => updatePair(key, key, e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removePair(key)}
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {param.help && (
          <p className="text-xs text-gray-500 mt-1">{param.help}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  };

  const configPanel = getConfigurationPanel();

  return (
    <div className="space-y-6">
      {configPanel || (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">{moduleDefinition.name}</h3>
                <p className="text-xs text-blue-700">{moduleDefinition.description}</p>
              </div>
            </div>
          </div>
          {renderGenericConfiguration()}
        </div>
      )}
    </div>
  );
};

export default ModuleConfigurationForm;
