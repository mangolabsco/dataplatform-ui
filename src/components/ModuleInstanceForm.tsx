import React, { useState, useEffect } from "react";
import { X, Database, Globe, FileText, Settings } from "lucide-react";
import { ModuleDefinition, ModuleInstance, ModuleType } from "../types/modules";
import ModuleConfigurationForm from "./configuration/ModuleConfigurationForm";

interface ModuleInstanceFormProps {
  moduleType: ModuleType;
  moduleDefinitions: ModuleDefinition[];
  instance: ModuleInstance | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ModuleInstanceForm: React.FC<ModuleInstanceFormProps> = ({
  moduleType,
  moduleDefinitions,
  instance,
  onSubmit,
  onCancel,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState(
    instance?.module_id || ""
  );
  const [name, setName] = useState(instance?.name || "");
  const [description, setDescription] = useState(instance?.description || "");
  const [configuration, setConfiguration] = useState<Record<string, any>>(
    instance?.configuration || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedModule = moduleDefinitions.find(
    (def) => def.id === selectedModuleId
  );

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      database: <Database className="w-5 h-5" />,
      globe: <Globe className="w-5 h-5" />,
      "file-text": <FileText className="w-5 h-5" />,
      settings: <Settings className="w-5 h-5" />,
    };
    return icons[iconName] || <Settings className="w-5 h-5" />;
  };

  useEffect(() => {
    if (selectedModule && !instance) {
      // Initialize configuration with default values for new instances
      const defaultConfig: Record<string, any> = {};
      selectedModule.parameters.forEach((param) => {
        if (param.default !== undefined) {
          defaultConfig[param.name] = param.default;
        }
      });
      setConfiguration(defaultConfig);
    }
  }, [selectedModule, instance]);

  const handleConfigurationChange = (paramName: string, value: any) => {
    setConfiguration((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!selectedModuleId) {
      newErrors.module_id = "Please select a module type";
    }

    if (selectedModule) {
      // Validate generic module parameters
      selectedModule.parameters.forEach((param) => {
        if (param.required && !configuration[param.name]) {
          newErrors[param.name] = `${param.label} is required`;
        }
      });

      // Additional validation for type-specific fields
      const moduleId = selectedModule.id.toLowerCase();

      // Database module validation
      if (moduleId.includes("database") || moduleId.includes("sql")) {
        if (!configuration.database_type) {
          newErrors.database_type = "Database type is required";
        }
        if (!configuration.hostname) {
          newErrors.hostname = "Hostname is required";
        }
        if (!configuration.port) {
          newErrors.port = "Port is required";
        }
        if (!configuration.database_name) {
          newErrors.database_name = "Database name is required";
        }
        if (!configuration.username) {
          newErrors.username = "Username is required";
        }
        if (!configuration.password) {
          newErrors.password = "Password is required";
        }
      }

      // API module validation
      if (moduleId.includes("api") || moduleId.includes("rest")) {
        if (!configuration.host) {
          newErrors.host = "Host is required";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      module_id: selectedModuleId,
      name: name.trim(),
      description: description.trim() || undefined,
      configuration,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${
                moduleType === 'sources' ? 'bg-green-100' :
                moduleType === 'transformations' ? 'bg-blue-100' :
                'bg-red-100'
              }`}>
                {moduleType === 'sources' && <Database className="w-5 h-5 text-green-600" />}
                {moduleType === 'transformations' && <Settings className="w-5 h-5 text-blue-600" />}
                {moduleType === 'sinks' && <Globe className="w-5 h-5 text-red-600" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {instance ? "Edit" : "Create"} {moduleType.slice(0, -1)}
                </h2>
                <p className="text-sm text-gray-600">
                  {instance ? 'Modify the configuration for this module' : 'Configure a new data source, transformation, or sink'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Module Selection */}
            {!instance && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {moduleDefinitions.map((def) => (
                    <div
                      key={def.id}
                      onClick={() => setSelectedModuleId(def.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedModuleId === def.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-3 rounded-lg ${
                            moduleType === "sources"
                              ? "bg-green-100 text-green-600"
                              : moduleType === "transformations"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {getIcon(def.icon || 'settings')}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {def.name}
                          </div>
                          <div className="text-xs text-gray-600 leading-relaxed">
                            {def.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Category: {def.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.module_id && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.module_id}
                  </p>
                )}
              </div>
            )}

            {/* Instance Details */}
            <div className="mb-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-100 p-2 rounded-lg mr-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Instance Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a descriptive name"
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a unique, descriptive name for this {moduleType.slice(0, -1)}
                    </p>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description for this instance"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all hover:border-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide additional context about this {moduleType.slice(0, -1)}'s purpose
                    </p>
                  </div>
                </div>

                {/* Show current module info when editing */}
                {instance && selectedModule && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          moduleType === "sources"
                            ? "bg-green-100 text-green-600"
                            : moduleType === "transformations"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {getIcon(selectedModule.icon || 'settings')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-blue-900">
                            {selectedModule.name}
                          </div>
                          <div className="text-xs text-blue-700">
                            {selectedModule.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {selectedModule.category}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration */}
            {selectedModule && (
              <div>
                <ModuleConfigurationForm
                  moduleDefinition={selectedModule}
                  configuration={configuration}
                  onChange={handleConfigurationChange}
                  errors={errors}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedModuleId || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {instance ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleInstanceForm;
