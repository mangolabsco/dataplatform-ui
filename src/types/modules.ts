/**
 * Represents a configurable parameter for a module definition.
 * This interface defines the structure and behavior of module parameters,
 * including validation rules, UI rendering hints, and dependency relationships.
 * 
 * @interface ModuleParameter
 */
export interface ModuleParameter {
  /** Unique identifier for the parameter */
  name: string;
  /** Human-readable label displayed in the UI */
  label: string;
  /** 
   * Data type that determines the UI component and validation behavior
   * - text: Single-line text input
   * - number: Numeric input with validation
   * - boolean: Checkbox or toggle
   * - select: Dropdown with predefined options
   * - textarea: Multi-line text input
   * - password: Masked text input
   * - dynamic_select: Dropdown with options loaded from API
   * - multi_select: Multiple selection from options
   * - key_value: Key-value pair editor
   * - json: JSON object editor with syntax validation
   */
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
  /** Whether this parameter must be provided */
  required: boolean;
  /** Default value used when parameter is not specified */
  default?: any;
  /** Hint text displayed in the input field */
  placeholder?: string;
  /** Help text providing additional context or instructions */
  help?: string;
  /** Available options for select/multi_select types */
  options?: string[];
  /** Parameter name that this parameter depends on for dynamic behavior */
  depends_on?: string;
  /** API endpoint to fetch dynamic options from */
  dynamic_options_endpoint?: string;
  /** Logical grouping for organizing related parameters */
  group?: string;
  /** Validation rules applied to the parameter value */
  validation?: {
    /** Minimum value for numbers or minimum length for strings */
    min?: number;
    /** Maximum value for numbers or maximum length for strings */
    max?: number;
    /** Regular expression pattern for string validation */
    pattern?: string;
    /** Custom validation type (e.g., 'email', 'url', 'ip_address') */
    custom?: string;
  };
}

/**
 * Defines a reusable module template with its configuration parameters.
 * Module definitions serve as templates for creating module instances,
 * providing the schema for configuration and metadata for UI display.
 * 
 * @interface ModuleDefinition
 */
export interface ModuleDefinition {
  /** Unique identifier for the module type */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Functional category (e.g., 'Database', 'API', 'File Processing') */
  category: string;
  /** Module type indicating its role in workflows */
  type: string;
  /** Detailed description of the module's functionality */
  description: string;
  /** Optional icon identifier for UI display */
  icon?: string;
  /** Configuration parameters required by this module */
  parameters: ModuleParameter[];
}

/**
 * Represents a configured instance of a module definition.
 * Module instances are concrete implementations of module definitions
 * with specific configuration values applied.
 * 
 * @interface ModuleInstance
 */
export interface ModuleInstance {
  /** Unique identifier for the instance (auto-generated) */
  id?: string;
  /** Reference to the module definition this instance is based on */
  module_id: string;
  /** User-defined name for this instance */
  name: string;
  /** Optional description providing context about this instance */
  description?: string;
  /** Configuration values mapped to parameter names */
  configuration: Record<string, any>;
  /** ISO timestamp of when the instance was created */
  created_at?: string;
  /** ISO timestamp of when the instance was last modified */
  updated_at?: string;
}

/**
 * Request payload for creating a new module instance.
 * This interface defines the required data structure when
 * submitting a request to create a new module instance.
 * 
 * @interface CreateModuleInstanceRequest
 */
export interface CreateModuleInstanceRequest {
  /** ID of the module definition to instantiate */
  module_id: string;
  /** User-defined name for the new instance */
  name: string;
  /** Optional description for the new instance */
  description?: string;
  /** Configuration values for the instance parameters */
  configuration: Record<string, any>;
}

/**
 * Configuration container for all available module definitions.
 * Organizes modules by their functional role in data processing workflows.
 * 
 * @interface ModulesConfig
 */
export interface ModulesConfig {
  /** Modules that read data from external sources */
  sources: ModuleDefinition[];
  /** Modules that process and transform data */
  transformations: ModuleDefinition[];
  /** Modules that write data to external destinations */
  sinks: ModuleDefinition[];
  /** Modules that create and manage data tables */
  tables: ModuleDefinition[];
}

/**
 * Union type representing the available module categories.
 * Used for type-safe categorization and filtering of modules.
 * 
 * @typedef {"sources" | "transformations" | "sinks" | "tables"} ModuleType
 */
export type ModuleType = "sources" | "transformations" | "sinks" | "tables";
