export interface ModuleParameter {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "select"
    | "textarea"
    | "password"
    | "dynamic_select"
    | "multi_select"
    | "key_value"
    | "json";
  required: boolean;
  default?: any;
  placeholder?: string;
  help?: string;
  options?: string[];
  // Dynamic options for parameters that depend on other parameters
  depends_on?: string; // Parameter name that this depends on
  dynamic_options_endpoint?: string; // API endpoint to fetch dynamic options
  // For grouped configurations
  group?: string;
  // For validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

export interface ModuleDefinition {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  icon?: string;
  parameters: ModuleParameter[];
}

export interface ModuleInstance {
  id?: string;
  module_id: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateModuleInstanceRequest {
  module_id: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
}

export interface ModulesConfig {
  sources: ModuleDefinition[];
  transformations: ModuleDefinition[];
  sinks: ModuleDefinition[];
  tables: ModuleDefinition[];
}

export type ModuleType = "sources" | "transformations" | "sinks" | "tables";
