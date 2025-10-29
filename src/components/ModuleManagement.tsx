import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Database,
  Globe,
  FileText,
  Settings,
  Filter,
  BarChart3,
  ArrowUpDown,
  Calculator,
} from "lucide-react";
import { ModuleInstance, ModulesConfig, ModuleType } from "../types/modules";
import ModuleInstanceForm from "./ModuleInstanceForm";
import { mockApi } from "../services/mockApi";

const ModuleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>("sources");
  const [moduleDefinitions, setModuleDefinitions] = useState<ModulesConfig>({
    sources: [],
    transformations: [],
    sinks: [],
    tables: [],
  });
  const [moduleInstances, setModuleInstances] = useState<
    Record<ModuleType, ModuleInstance[]>
  >({
    sources: [],
    transformations: [],
    sinks: [],
    tables: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editingInstance, setEditingInstance] = useState<ModuleInstance | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      database: <Database className="w-5 h-5" />,
      globe: <Globe className="w-5 h-5" />,
      "file-text": <FileText className="w-5 h-5" />,
      settings: <Settings className="w-5 h-5" />,
      filter: <Filter className="w-5 h-5" />,
      "bar-chart-3": <BarChart3 className="w-5 h-5" />,
      "arrow-up-down": <ArrowUpDown className="w-5 h-5" />,
      calculator: <Calculator className="w-5 h-5" />,
      columns: <Settings className="w-5 h-5" />,
    };
    return icons[iconName] || <Settings className="w-5 h-5" />;
  };

  const fetchModuleDefinitions = async () => {
    try {
      const data = await mockApi.getModules();
      setModuleDefinitions(data);
    } catch (error) {
      console.error("Error fetching module definitions:", error);
    }
  };

  const fetchModuleInstances = async () => {
    try {
      const data = await mockApi.getModuleInstances();
      setModuleInstances(data);
    } catch (error) {
      console.error("Error fetching module instances:", error);
    }
  };

  const handleCreateInstance = () => {
    setEditingInstance(null);
    setShowForm(true);
  };

  const handleEditInstance = (instance: ModuleInstance) => {
    setEditingInstance(instance);
    setShowForm(true);
  };

  const handleDeleteInstance = async (instanceId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this module instance?")
    ) {
      return;
    }

    try {
      await mockApi.deleteModuleInstance(activeTab, instanceId);
      await fetchModuleInstances();
    } catch (error) {
      console.error("Error deleting module instance:", error);
      alert("Failed to delete module instance");
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingInstance) {
        await mockApi.updateModuleInstance(
          activeTab,
          editingInstance.id!,
          data
        );
      } else {
        await mockApi.createModuleInstance(activeTab, data);
      }

      await fetchModuleInstances();
      setShowForm(false);
      setEditingInstance(null);
    } catch (error) {
      console.error("Error saving module instance:", error);
      alert(
        `Failed to ${editingInstance ? "update" : "create"} module instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchModuleDefinitions(), fetchModuleInstances()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const tabs = [
    { key: "sources" as ModuleType, label: "Sources", color: "text-green-600" },
    {
      key: "transformations" as ModuleType,
      label: "Transformations",
      color: "text-blue-600",
    },
    { key: "sinks" as ModuleType, label: "Sinks", color: "text-red-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Module Management
          </h1>
          <button
            onClick={handleCreateInstance}
            className="flex items-center px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar with tabs */}
        <div className="w-64 bg-muted border-r border-border">
          <div className="p-6">
            <nav className="space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-background text-foreground">
                    {moduleInstances[tab.key]?.length || 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {tabs.find((tab) => tab.key === activeTab)?.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your configured {activeTab} modules.
            </p>
          </div>

          {moduleInstances[activeTab]?.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground text-lg mb-3">
                No {activeTab} configured
              </div>
              <div className="text-muted-foreground text-sm mb-6">
                Create your first {activeTab.slice(0, -1)} to get started.
              </div>
              <button
                onClick={handleCreateInstance}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors duration-200"
              >
                Create {activeTab.slice(0, -1)}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleInstances[activeTab]?.map((instance) => {
                const definition = moduleDefinitions[activeTab].find(
                  (def) => def.id === instance.module_id
                );
                return (
                  <div
                    key={instance.id}
                    className="bg-card rounded-lg shadow-sm border border-border p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div
                          className={`rounded-lg p-3 ${
                            activeTab === "sources"
                              ? "bg-green-100 text-green-600"
                              : activeTab === "transformations"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {getIcon(definition?.icon || "settings")}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-foreground">
                            {instance.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {definition?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditInstance(instance)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstance(instance.id!)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent rounded-md transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {instance.description && (
                      <p className="text-xs text-muted-foreground mt-3">
                        {instance.description}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        Created:{" "}
                        {new Date(instance.created_at!).toLocaleDateString()}
                      </div>
                      {instance.updated_at !== instance.created_at && (
                        <div className="text-xs text-muted-foreground">
                          Updated:{" "}
                          {new Date(instance.updated_at!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ModuleInstanceForm
          moduleType={activeTab}
          moduleDefinitions={moduleDefinitions[activeTab]}
          instance={editingInstance}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingInstance(null);
          }}
        />
      )}
    </div>
  );
};

export default ModuleManagement;
