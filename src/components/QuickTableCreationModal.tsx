import React, { useState, useEffect } from 'react';
import { X, Database, Clock, HardDrive, Plus } from 'lucide-react';
import { ModuleInstance } from '../types/modules';
import { mockApi } from '../services/mockApi';

interface QuickTableCreationModalProps {
  isOpen: boolean;
  tableType: 'temporary' | 'persistent' | 'versioned';
  position: { x: number; y: number };
  onSelect: (tableInstance: ModuleInstance) => void;
  onCancel: () => void;
}

const QuickTableCreationModal: React.FC<QuickTableCreationModalProps> = ({
  isOpen,
  tableType,
  position,
  onSelect,
  onCancel
}) => {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [existingTables, setExistingTables] = useState<ModuleInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('');

  // New table creation state
  const [newTableName, setNewTableName] = useState('');
  const [newTableDescription, setNewTableDescription] = useState('');
  const [retentionHours, setRetentionHours] = useState(24);
  const [writeMode, setWriteMode] = useState('append');
  const [versionStrategy, setVersionStrategy] = useState('timestamp');
  const [maxVersions, setMaxVersions] = useState(10);

  const getTableTypeConfig = () => {
    switch (tableType) {
      case 'temporary':
        return {
          moduleId: 'temporary_table',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          title: 'Temporary Table'
        };
      case 'persistent':
        return {
          moduleId: 'persistent_table',
          icon: HardDrive,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200',
          title: 'Persistent Table'
        };
      case 'versioned':
        return {
          moduleId: 'versioned_table',
          icon: Database,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          title: 'Versioned Table'
        };
      default:
        return {
          moduleId: 'temporary_table',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          title: 'Temporary Table'
        };
    }
  };

  const config = getTableTypeConfig();
  const IconComponent = config.icon;

  useEffect(() => {
    if (isOpen) {
      loadExistingTables();
      setShowCreateNew(false);
      setSelectedTable('');
      resetNewTableForm();
    }
  }, [isOpen, tableType]);

  const loadExistingTables = async () => {
    setLoading(true);
    try {
      const tables = await mockApi.getModuleInstancesByType('tables');
      const filteredTables = tables.filter(table => 
        table.module_id === config.moduleId
      );
      setExistingTables(filteredTables);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetNewTableForm = () => {
    setNewTableName('');
    setNewTableDescription('');
    setRetentionHours(24);
    setWriteMode('append');
    setVersionStrategy('timestamp');
    setMaxVersions(10);
  };

  const handleCreateNew = async () => {
    if (!newTableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    try {
      let configuration: any = {
        table_name: newTableName.toLowerCase().replace(/\s+/g, '_'),
        description: newTableDescription
      };

      switch (tableType) {
        case 'temporary':
          configuration.retention_hours = retentionHours;
          break;
        case 'persistent':
          configuration.write_mode = writeMode;
          configuration.primary_key = '';
          configuration.indexes = '';
          break;
        case 'versioned':
          configuration.version_strategy = versionStrategy;
          configuration.max_versions = maxVersions;
          break;
      }

      const newTableInstance = await mockApi.createModuleInstance('tables', {
        module_id: config.moduleId,
        name: newTableName,
        description: newTableDescription,
        configuration
      });

      onSelect(newTableInstance);
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table instance');
    }
  };

  const handleSelectExisting = () => {
    const table = existingTables.find(t => t.id === selectedTable);
    if (table) {
      onSelect(table);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${config.bgColor}`}>
              <IconComponent className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {config.title} Setup
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Use existing table or create a new one
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {/* Action Selection */}
          <div className="flex space-x-6 mb-8">
            <button
              onClick={() => setShowCreateNew(false)}
              className={`flex-1 p-6 border-2 rounded-lg text-center transition-all ${
                !showCreateNew
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border hover:border-input text-muted-foreground'
              }`}
            >
              <Database className="w-6 h-6 mx-auto mb-3" />
              <div className="font-medium">Use Existing</div>
              <div className="text-xs text-muted-foreground">{existingTables.length} available</div>
            </button>
            <button
              onClick={() => setShowCreateNew(true)}
              className={`flex-1 p-6 border-2 rounded-lg text-center transition-all ${
                showCreateNew
                  ? 'border-primary bg-accent text-foreground'
                  : 'border-border hover:border-input text-muted-foreground'
              }`}
            >
              <Plus className="w-6 h-6 mx-auto mb-3" />
              <div className="font-medium">Create New</div>
              <div className="text-xs text-muted-foreground">Quick setup</div>
            </button>
          </div>

          {/* Existing Tables Selection */}
          {!showCreateNew && (
            <div>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading tables...</div>
              ) : existingTables.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-3">No existing {tableType} tables found</div>
                  <button
                    onClick={() => setShowCreateNew(true)}
                    className="text-primary hover:text-primary/80 text-sm transition-colors duration-200"
                  >
                    Create your first {tableType} table →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm font-medium text-foreground mb-4">
                    Select an existing {tableType} table:
                  </div>
                  {existingTables.map((table) => (
                    <label
                      key={table.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                        selectedTable === table.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:border-input'
                      }`}
                    >
                      <input
                        type="radio"
                        name="existingTable"
                        value={table.id}
                        checked={selectedTable === table.id}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded ${config.bgColor} mr-3`}>
                        <IconComponent className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{table.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Table: {table.configuration?.table_name}
                        </div>
                        {table.description && (
                          <div className="text-xs text-muted-foreground mt-2">{table.description}</div>
                        )}
                      </div>
                      {selectedTable === table.id && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create New Table Form */}
          {showCreateNew && (
            <div className="space-y-6">
              <div className="text-sm font-medium text-foreground mb-6">
                Create a new {tableType} table:
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Table Name *
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                  placeholder={`My ${tableType} table`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Description
                </label>
                <textarea
                  value={newTableDescription}
                  onChange={(e) => setNewTableDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
                  placeholder="Describe what this table will store..."
                />
              </div>

              {/* Type-specific configurations */}
              {tableType === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Retention (Hours)
                  </label>
                  <input
                    type="number"
                    value={retentionHours}
                    onChange={(e) => setRetentionHours(parseInt(e.target.value) || 24)}
                    className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    min="1"
                    max="168"
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    Data will be automatically deleted after this period
                  </div>
                </div>
              )}

              {tableType === 'persistent' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Write Mode
                  </label>
                  <select
                    value={writeMode}
                    onChange={(e) => setWriteMode(e.target.value)}
                    className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    <option value="append">Append - Add new records</option>
                    <option value="overwrite">Overwrite - Replace all data</option>
                    <option value="upsert">Upsert - Insert or update</option>
                  </select>
                </div>
              )}

              {tableType === 'versioned' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Version Strategy
                    </label>
                    <select
                      value={versionStrategy}
                      onChange={(e) => setVersionStrategy(e.target.value)}
                      className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    >
                      <option value="timestamp">Timestamp</option>
                      <option value="incremental">Incremental</option>
                      <option value="semantic">Semantic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Max Versions
                    </label>
                    <input
                      type="number"
                      value={maxVersions}
                      onChange={(e) => setMaxVersions(parseInt(e.target.value) || 10)}
                      className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-border bg-muted">
          <div className="text-sm text-muted-foreground">
            {showCreateNew 
              ? 'Fill in the details to create a new table' 
              : selectedTable 
                ? 'Table selected and ready to use' 
                : 'Select a table to continue'
            }
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-accent transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={showCreateNew ? handleCreateNew : handleSelectExisting}
              disabled={showCreateNew ? !newTableName.trim() : !selectedTable}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {showCreateNew ? 'Create & Use' : 'Use Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTableCreationModal;
