import React, { useState, useEffect } from 'react';
import { X, Database, Globe, FileText, Settings, Filter, BarChart3, ArrowUpDown, Calculator } from 'lucide-react';
import { ModuleDefinition, ModuleInstance, ModulesConfig, ModuleType } from '../types/modules';
import { mockApi } from '../services/mockApi';

interface ModuleSelectionModalProps {
  isOpen: boolean;
  nodeType: 'source' | 'transformation' | 'sink' | 'table';
  position: { x: number; y: number };
  onSelect: (moduleInstance: ModuleInstance, moduleDefinition: ModuleDefinition) => void;
  onCancel: () => void;
}

const ModuleSelectionModal: React.FC<ModuleSelectionModalProps> = ({
  isOpen,
  nodeType,
  position,
  onSelect,
  onCancel
}) => {
  const [moduleDefinitions, setModuleDefinitions] = useState<ModulesConfig>({
    sources: [],
    transformations: [],
    sinks: [],
    tables: []
  });
  const [moduleInstances, setModuleInstances] = useState<Record<ModuleType, ModuleInstance[]>>({
    sources: [],
    transformations: [],
    sinks: [],
    tables: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<string>('');

  // Map node type to module type
  const moduleType: ModuleType = nodeType === 'source' ? 'sources' : 
                                 nodeType === 'transformation' ? 'transformations' : 
                                 nodeType === 'sink' ? 'sinks' : 'tables';

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      database: <Database className="w-5 h-5" />,
      globe: <Globe className="w-5 h-5" />,
      'file-text': <FileText className="w-5 h-5" />,
      settings: <Settings className="w-5 h-5" />,
      filter: <Filter className="w-5 h-5" />,
      'bar-chart-3': <BarChart3 className="w-5 h-5" />,
      'arrow-up-down': <ArrowUpDown className="w-5 h-5" />,
      calculator: <Calculator className="w-5 h-5" />,
      columns: <Settings className="w-5 h-5" />
    };
    return icons[iconName] || <Settings className="w-5 h-5" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'source':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'transformation':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'sink':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'table':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [definitions, instances] = await Promise.all([
        mockApi.getModules(),
        mockApi.getModuleInstances()
      ]);
      
      setModuleDefinitions(definitions);
      setModuleInstances(instances);
    } catch (error) {
      console.error('Error fetching module data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (!selectedInstance) return;

    const instance = moduleInstances[moduleType].find(inst => inst.id === selectedInstance);
    const definition = moduleDefinitions[moduleType].find(def => def.id === instance?.module_id);

    if (instance && definition) {
      onSelect(instance, definition);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Select {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Module
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Choose a configured module instance to add to your workflow
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-lg text-muted-foreground">Loading modules...</div>
            </div>
          ) : moduleInstances[moduleType]?.length === 0 ? (
            <div className="text-center py-16">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getTypeColor(nodeType)} mb-6`}>
                {nodeType === 'source' ? <Database className="w-8 h-8" /> :
                 nodeType === 'transformation' ? <Settings className="w-8 h-8" /> :
                 nodeType === 'table' ? <Database className="w-8 h-8" /> :
                 <FileText className="w-8 h-8" />}
              </div>
              <div className="text-muted-foreground text-lg mb-3">
                No {nodeType} modules configured
              </div>
              <div className="text-muted-foreground text-sm mb-6">
                You need to create {nodeType} module instances before you can add them to your workflow.
              </div>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-md hover:bg-secondary/80 transition-colors duration-200"
              >
                Go to Module Management
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground mb-4">
                Available {nodeType} instances ({moduleInstances[moduleType]?.length}):
              </div>
              
              {moduleInstances[moduleType]?.map((instance) => {
                const definition = moduleDefinitions[moduleType].find(def => def.id === instance.module_id);
                return (
                  <label
                    key={instance.id}
                    className={`flex items-center p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedInstance === instance.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-input'
                    }`}
                  >
                    <input
                      type="radio"
                      name="moduleInstance"
                      value={instance.id}
                      checked={selectedInstance === instance.id}
                      onChange={(e) => setSelectedInstance(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getTypeColor(nodeType)} mr-4`}>
                      {getIcon(definition?.icon || 'settings')}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{instance.name}</h3>
                          <p className="text-xs text-muted-foreground">{definition?.name}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            nodeType === 'source' ? 'bg-green-100 text-green-800' :
                            nodeType === 'transformation' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {definition?.type || nodeType}
                          </div>
                        </div>
                      </div>
                      
                      {instance.description && (
                        <p className="text-xs text-muted-foreground mt-3">{instance.description}</p>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(instance.created_at!).toLocaleDateString()}
                        </div>
                        {/* Configuration preview */}
                        <div className="text-xs text-muted-foreground">
                          {Object.keys(instance.configuration || {}).length} config params
                        </div>
                      </div>
                    </div>
                    
                    {selectedInstance === instance.id && (
                      <div className="ml-4">
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && moduleInstances[moduleType]?.length > 0 && (
          <div className="flex items-center justify-between p-8 border-t border-border bg-muted">
            <div className="text-sm text-muted-foreground">
              {selectedInstance ? 'Module instance selected' : 'Select a module instance to continue'}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedInstance}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Add to Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleSelectionModal;
