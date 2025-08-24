import { ModuleDefinition, ModuleInstance, ModulesConfig, ModuleType } from '../types/modules';
import mockModulesData from '../data/mock-modules.json';
import mockInstancesData from '../data/mock-module-instances.json';
import mockWorkflowsData from '../data/mock-workflows.json';

// Local storage keys
const STORAGE_KEYS = {
  MODULE_INSTANCES: 'mock_module_instances',
  WORKFLOWS: 'mock_workflows',
  LAST_ID: 'mock_last_id'
};

class MockApiService {
  private moduleDefinitions: ModulesConfig;
  private lastId: number;

  constructor() {
    this.moduleDefinitions = mockModulesData as ModulesConfig;
    this.lastId = this.getLastId();
    
    // Initialize localStorage with mock data if it doesn't exist
    this.initializeStorage();
  }

  private getLastId(): number {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_ID);
    return stored ? parseInt(stored, 10) : 1000;
  }

  private setLastId(id: number): void {
    this.lastId = id;
    localStorage.setItem(STORAGE_KEYS.LAST_ID, id.toString());
  }

  private generateId(): string {
    const newId = this.lastId + 1;
    this.setLastId(newId);
    return newId.toString();
  }

  private initializeStorage(): void {
    const existingInstances = localStorage.getItem(STORAGE_KEYS.MODULE_INSTANCES);
    if (!existingInstances) {
      localStorage.setItem(STORAGE_KEYS.MODULE_INSTANCES, JSON.stringify(mockInstancesData));
    }
    
    const existingWorkflows = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    if (!existingWorkflows) {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(mockWorkflowsData));
    }
  }

  private getStoredInstances(): Record<ModuleType, ModuleInstance[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.MODULE_INSTANCES);
    if (stored) {
      return JSON.parse(stored);
    }
    return { sources: [], transformations: [], sinks: [], tables: [] };
  }

  private setStoredInstances(instances: Record<ModuleType, ModuleInstance[]>): void {
    localStorage.setItem(STORAGE_KEYS.MODULE_INSTANCES, JSON.stringify(instances));
  }

  private getStoredWorkflows(): any {
    const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    if (stored) {
      return JSON.parse(stored);
    }
    return { workflows: [] };
  }

  private setStoredWorkflows(data: any): void {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(data));
  }

  // Simulate API delay
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all module definitions
  async getModules(): Promise<ModulesConfig> {
    await this.delay();
    return this.moduleDefinitions;
  }

  // Get all module instances
  async getModuleInstances(): Promise<Record<ModuleType, ModuleInstance[]>> {
    await this.delay();
    return this.getStoredInstances();
  }

  // Get module instances for a specific type
  async getModuleInstancesByType(moduleType: ModuleType): Promise<ModuleInstance[]> {
    await this.delay();
    const instances = this.getStoredInstances();
    return instances[moduleType] || [];
  }

  // Create a new module instance
  async createModuleInstance(
    moduleType: ModuleType, 
    data: {
      module_id: string;
      name: string;
      description?: string;
      configuration: Record<string, any>;
    }
  ): Promise<ModuleInstance> {
    await this.delay();

    // Validate that the module_id exists in definitions
    const moduleExists = this.moduleDefinitions[moduleType].some(def => def.id === data.module_id);
    if (!moduleExists) {
      throw new Error(`Module with ID ${data.module_id} not found in ${moduleType}`);
    }

    const instances = this.getStoredInstances();
    const now = new Date().toISOString();
    
    const newInstance: ModuleInstance = {
      id: this.generateId(),
      module_id: data.module_id,
      name: data.name,
      description: data.description,
      configuration: data.configuration,
      created_at: now,
      updated_at: now
    };

    instances[moduleType] = instances[moduleType] || [];
    instances[moduleType].push(newInstance);
    
    this.setStoredInstances(instances);
    return newInstance;
  }

  // Update an existing module instance
  async updateModuleInstance(
    moduleType: ModuleType,
    instanceId: string,
    data: {
      module_id: string;
      name: string;
      description?: string;
      configuration: Record<string, any>;
    }
  ): Promise<ModuleInstance> {
    await this.delay();

    const instances = this.getStoredInstances();
    const moduleInstances = instances[moduleType] || [];
    const instanceIndex = moduleInstances.findIndex(inst => inst.id === instanceId);

    if (instanceIndex === -1) {
      throw new Error(`Module instance with ID ${instanceId} not found`);
    }

    const existingInstance = moduleInstances[instanceIndex];
    const updatedInstance: ModuleInstance = {
      ...existingInstance,
      module_id: data.module_id,
      name: data.name,
      description: data.description,
      configuration: data.configuration,
      updated_at: new Date().toISOString()
    };

    instances[moduleType][instanceIndex] = updatedInstance;
    this.setStoredInstances(instances);
    
    return updatedInstance;
  }

  // Delete a module instance
  async deleteModuleInstance(moduleType: ModuleType, instanceId: string): Promise<void> {
    await this.delay();

    const instances = this.getStoredInstances();
    const moduleInstances = instances[moduleType] || [];
    const instanceIndex = moduleInstances.findIndex(inst => inst.id === instanceId);

    if (instanceIndex === -1) {
      throw new Error(`Module instance with ID ${instanceId} not found`);
    }

    instances[moduleType].splice(instanceIndex, 1);
    this.setStoredInstances(instances);
  }

  // Test connection (mock implementation)
  async testConnection(
    endpoint: string,
    payload: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    await this.delay(1000); // Simulate longer delay for connection test

    // Mock logic - randomly succeed or fail for demo purposes
    const shouldSucceed = Math.random() > 0.3; // 70% success rate

    if (shouldSucceed) {
      return {
        success: true,
        message: 'Connection successful!'
      };
    } else {
      return {
        success: false,
        message: 'Connection failed: Unable to connect to the specified endpoint'
      };
    }
  }

  // Reset storage to initial state (useful for testing)
  resetStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.MODULE_INSTANCES);
    localStorage.removeItem(STORAGE_KEYS.LAST_ID);
    this.lastId = 1000;
    this.initializeStorage();
  }

  // Workflow-related methods
  async getWorkflows(): Promise<any[]> {
    await this.delay();
    // Try file-backed API first
    try {
      const resp = await fetch('/mock-api/workflows');
      if (resp.ok) {
        const json = await resp.json();
        return Array.isArray(json) ? json : [];
      }
    } catch (_) {
      // fall back to localStorage
    }
    const data = this.getStoredWorkflows();
    return data.workflows || [];
  }

  async getWorkflowById(workflowId: string): Promise<any | null> {
    await this.delay();
    try {
      const resp = await fetch(`/mock-api/workflows/${encodeURIComponent(workflowId)}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (_) {}
    const data = this.getStoredWorkflows();
    const workflow = data.workflows.find((w: any) => w.id === workflowId);
    return workflow || null;
  }

  async saveWorkflow(workflowData: any): Promise<any> {
    await this.delay();
    // Try to persist to file-backed API
    try {
      const resp = await fetch('/mock-api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (_) {}

    // Fallback: localStorage
    const data = this.getStoredWorkflows();
    const now = new Date().toISOString();
    
    const workflow = {
      id: this.generateId(),
      name: workflowData.name || 'Untitled Workflow',
      description: workflowData.description || '',
      status: 'draft',
      created_at: now,
      updated_at: now,
      last_execution: null,
      execution_status: 'pending',
      nodes: workflowData.nodes || [],
      edges: workflowData.edges || [],
      viewport: workflowData.viewport || { x: 0, y: 0, zoom: 1 }
    };
    
    data.workflows.push(workflow);
    this.setStoredWorkflows(data);
    return workflow;
  }

  async updateWorkflow(workflowId: string, workflowData: any): Promise<any> {
    await this.delay();
    try {
      const resp = await fetch(`/mock-api/workflows/${encodeURIComponent(workflowId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (_) {}

    // Fallback: localStorage
    const data = this.getStoredWorkflows();
    const workflowIndex = data.workflows.findIndex((w: any) => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    data.workflows[workflowIndex] = {
      ...data.workflows[workflowIndex],
      ...workflowData,
      updated_at: new Date().toISOString()
    };
    
    this.setStoredWorkflows(data);
    return data.workflows[workflowIndex];
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.delay();
    try {
      const resp = await fetch(`/mock-api/workflows/${encodeURIComponent(workflowId)}`, { method: 'DELETE' });
      if (resp.ok || resp.status === 204) {
        return;
      }
    } catch (_) {}

    // Fallback: localStorage
    const data = this.getStoredWorkflows();
    const workflowIndex = data.workflows.findIndex((w: any) => w.id === workflowId);
    
    if (workflowIndex === -1) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    data.workflows.splice(workflowIndex, 1);
    this.setStoredWorkflows(data);
  }

  async executeWorkflow(workflowId: string): Promise<{ success: boolean; message: string; executionId?: string }> {
    await this.delay(2000); // Simulate longer delay for execution

    // Try file-backed API
    try {
      const resp = await fetch(`/mock-api/workflows/${encodeURIComponent(workflowId)}/execute`, { method: 'POST' });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (_) {}
    
    // Fallback: localStorage-based simulation
    const data = this.getStoredWorkflows();
    const workflowIndex = data.workflows.findIndex((w: any) => w.id === workflowId);
    
    if (workflowIndex !== -1) {
      data.workflows[workflowIndex].last_execution = new Date().toISOString();
      data.workflows[workflowIndex].execution_status = Math.random() > 0.2 ? 'success' : 'failed';
      this.setStoredWorkflows(data);
    }
    
    const shouldSucceed = Math.random() > 0.2; // 80% success rate for workflows
    
    if (shouldSucceed) {
      return {
        success: true,
        message: 'Workflow execution started successfully',
        executionId: `exec_${this.generateId()}`
      };
    } else {
      return {
        success: false,
        message: 'Workflow execution failed: Invalid configuration or connection error'
      };
    }
  }

  // Get storage info (for debugging)
  getStorageInfo(): {
    instancesSize: number;
    lastId: number;
    totalInstances: number;
    totalWorkflows: number;
  } {
    const instances = this.getStoredInstances();
    const workflows = this.getStoredWorkflows();
    const total = Object.values(instances).reduce((sum, arr) => sum + arr.length, 0);
    
    return {
      instancesSize: JSON.stringify(instances).length,
      lastId: this.lastId,
      totalInstances: total,
      totalWorkflows: workflows.workflows?.length || 0
    };
  }
}

// Export singleton instance
export const mockApiService = new MockApiService();

// Export mock API functions that mimic fetch API
export const mockApi = {
  // Module-related endpoints
  getModules: () => mockApiService.getModules(),
  getModuleInstances: () => mockApiService.getModuleInstances(),
  getModuleInstancesByType: (moduleType: ModuleType) => 
    mockApiService.getModuleInstancesByType(moduleType),
  createModuleInstance: (moduleType: ModuleType, data: any) =>
    mockApiService.createModuleInstance(moduleType, data),
  updateModuleInstance: (moduleType: ModuleType, instanceId: string, data: any) =>
    mockApiService.updateModuleInstance(moduleType, instanceId, data),
  deleteModuleInstance: (moduleType: ModuleType, instanceId: string) =>
    mockApiService.deleteModuleInstance(moduleType, instanceId),
  testConnection: (endpoint: string, payload: Record<string, any>) =>
    mockApiService.testConnection(endpoint, payload),
    
  // Workflow-related endpoints
  getWorkflows: () => mockApiService.getWorkflows(),
  getWorkflowById: (workflowId: string) => mockApiService.getWorkflowById(workflowId),
  saveWorkflow: (workflowData: any) => mockApiService.saveWorkflow(workflowData),
  updateWorkflow: (workflowId: string, workflowData: any) => 
    mockApiService.updateWorkflow(workflowId, workflowData),
  deleteWorkflow: (workflowId: string) => mockApiService.deleteWorkflow(workflowId),
  executeWorkflow: (workflowId: string) => mockApiService.executeWorkflow(workflowId)
};

export default mockApi;
