/**
 * Data structure for workflow nodes containing display and configuration information.
 * This interface defines the core properties that every node in a workflow must have.
 * 
 * @interface NodeData
 */
export interface NodeData {
  /** Display label shown on the node in the workflow canvas */
  label: string;
  /** Node type determining its role in the data processing pipeline */
  type: 'source' | 'transformation' | 'sink' | 'table';
  /** Optional configuration object containing node-specific settings */
  config?: Record<string, any>;
}

/**
 * Complete workflow node definition including position and visual properties.
 * Extends NodeData with additional properties required for workflow canvas rendering.
 * 
 * @interface WorkflowNode
 */
export interface WorkflowNode {
  /** Unique identifier for the node within the workflow */
  id: string;
  /** React Flow node type for rendering (e.g., 'sourceNode', 'transformNode') */
  type: string;
  /** Canvas position coordinates */
  position: { x: number; y: number };
  /** Core node data containing business logic properties */
  data: NodeData;
}

/**
 * Connection between workflow nodes representing data flow.
 * Defines the relationship and data transfer path between nodes.
 * 
 * @interface WorkflowEdge
 */
export interface WorkflowEdge {
  /** Unique identifier for the edge */
  id: string;
  /** ID of the source node where data originates */
  source: string;
  /** ID of the target node where data flows to */
  target: string;
  /** Optional edge type for custom rendering or behavior */
  type?: string;
}

/**
 * Configuration interface for data source nodes.
 * Defines the connection parameters and query settings for various data sources.
 * 
 * @interface SourceConfig
 */
export interface SourceConfig {
  /** Type of data source */
  type: 'database' | 'api' | 'file';
  /** Database connection string (for database sources) */
  connectionString?: string;
  /** API endpoint URL (for API sources) */
  endpoint?: string;
  /** File path or URL (for file sources) */
  filePath?: string;
  /** SQL query or filter expression to apply */
  query?: string;
  /** HTTP headers for API requests */
  headers?: Record<string, string>;
}

/**
 * Configuration interface for data transformation nodes.
 * Defines the type of transformation and associated parameters.
 * 
 * @interface TransformationConfig
 */
export interface TransformationConfig {
  /** Type of transformation operation to perform */
  type: 'filter' | 'map' | 'aggregate' | 'join';
  /** Specific operation definition or expression */
  operation: string;
  /** Additional parameters required by the transformation */
  parameters?: Record<string, any>;
}

/**
 * Configuration interface for data sink nodes.
 * Defines the output destination and connection parameters for data export.
 * 
 * @interface SinkConfig
 */
export interface SinkConfig {
  /** Type of destination for data output */
  type: 'database' | 'api' | 'file';
  /** Database connection string (for database sinks) */
  connectionString?: string;
  /** API endpoint URL (for API sinks) */
  endpoint?: string;
  /** Output file path or URL (for file sinks) */
  filePath?: string;
  /** HTTP method for API requests (GET, POST, PUT, etc.) */
  method?: string;
  /** HTTP headers for API requests */
  headers?: Record<string, string>;
}

/**
 * Configuration interface for table nodes.
 * Defines table properties including schema, storage, and retention settings.
 * 
 * @interface TableConfig
 */
export interface TableConfig {
  /** Name of the table to create or reference */
  tableName: string;
  /** Storage persistence type */
  storageType: 'temporary' | 'persistent';
  /** Column definitions mapping column names to data types */
  schema?: Record<string, string>;
  /** Data retention policy or duration */
  retention?: string;
  /** Human-readable description of the table purpose */
  description?: string;
}

/**
 * Constant definitions for node types used throughout the application.
 * Provides type-safe string constants to prevent typos and ensure consistency.
 * 
 * @constant
 * @readonly
 */
export const NODE_TYPES = {
  /** Data input/source node type */
  SOURCE: 'source',
  /** Data transformation/processing node type */
  TRANSFORMATION: 'transformation', 
  /** Data output/destination node type */
  SINK: 'sink',
  /** Data table/storage node type */
  TABLE: 'table'
} as const;
