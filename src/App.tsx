import React, { useState } from "react";
import "./App.css";
import WorkflowEditor from "./components/WorkflowEditor";
import WorkflowDashboard from "./components/WorkflowDashboard";
import ModuleManagement from "./components/ModuleManagement";
import Settings from "./components/Settings";
import { Workflow, Settings as SettingsIcon, Home, List } from "lucide-react";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./contexts/ThemeContext";

/**
 * Defines the available views/pages in the application
 * @typedef {'dashboard' | 'builder' | 'modules' | 'settings'} View
 */
type View = "dashboard" | "builder" | "modules" | "settings";

/**
 * Main application component that manages the overall layout and navigation.
 * This component serves as the root of the Data Platform UI application,
 * providing a navigation header and rendering different views based on user selection.
 *
 * Features:
 * - Dynamic navigation between different sections (Dashboard, Module Management, Settings)
 * - Workflow creation and editing functionality
 * - Responsive layout with theme support
 * - State management for current view and workflow context
 *
 * @component
 * @returns {JSX.Element} The main application layout with navigation and content areas
 */
function App() {
  // State management for application navigation and workflow context
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );

  /**
   * Navigation configuration defining available application sections
   * Each item includes a unique key, display label, and corresponding icon
   */
  const navigation = [
    { key: "dashboard" as View, label: "Workflows", icon: List },
    { key: "modules" as View, label: "Module Management", icon: SettingsIcon },
    { key: "settings" as View, label: "Settings", icon: SettingsIcon },
  ];

  /**
   * Initiates the creation of a new workflow by navigating to the builder view
   * Resets any existing workflow context to ensure a clean state
   */
  const handleCreateNewWorkflow = () => {
    setCurrentWorkflowId(null);
    setCurrentView("builder");
  };

  /**
   * Navigates to the workflow editor for editing an existing workflow
   *
   * @param {string} workflowId - The unique identifier of the workflow to edit
   */
  const handleEditWorkflow = (workflowId: string) => {
    setCurrentWorkflowId(workflowId);
    setCurrentView("builder");
  };

  /**
   * Returns to the main dashboard view and clears workflow context
   * Used when exiting the workflow builder
   */
  const handleBackToDashboard = () => {
    setCurrentWorkflowId(null);
    setCurrentView("dashboard");
  };

  return (
    <div className="App h-screen flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Home className="w-6 h-6 text-primary mr-3" />
              <h1 className="text-xl font-bold text-foreground">
                Data Platform
              </h1>
            </div>
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.key;
                return (
                  <Button
                    key={item.key}
                    onClick={() => setCurrentView(item.key)}
                    variant={isActive ? "default" : "ghost"}
                    className="px-4"
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {currentView === "dashboard" && (
          <WorkflowDashboard
            onCreateNew={handleCreateNewWorkflow}
            onEditWorkflow={handleEditWorkflow}
          />
        )}
        {currentView === "builder" && (
          <WorkflowEditor
            workflowId={currentWorkflowId}
            onBack={handleBackToDashboard}
          />
        )}
        {currentView === "modules" && <ModuleManagement />}
        {currentView === "settings" && <Settings />}
      </div>
    </div>
  );
}

/**
 * Higher-order component that wraps the main App component with theme context.
 * Provides theme management capabilities throughout the application, including
 * support for light, dark, and system-based themes.
 *
 * @component
 * @returns {JSX.Element} The App component wrapped with ThemeProvider
 */
const AppWithTheme: React.FC = () => (
  <ThemeProvider defaultTheme="system">
    <App />
  </ThemeProvider>
);

export default AppWithTheme;
