export interface NodeData {
  label: string;
  type: 'source' | 'transformation' | 'sink' | 'table';
  config?: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface SourceConfig {
  type: 'database' | 'api' | 'file';
  connectionString?: string;
  endpoint?: string;
  filePath?: string;
  query?: string;
  headers?: Record<string, string>;
}

export interface TransformationConfig {
  type: 'filter' | 'map' | 'aggregate' | 'join';
  operation: string;
  parameters?: Record<string, any>;
}

export interface SinkConfig {
  type: 'database' | 'api' | 'file';
  connectionString?: string;
  endpoint?: string;
  filePath?: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface TableConfig {
  tableName: string;
  storageType: 'temporary' | 'persistent';
  schema?: Record<string, string>;
  retention?: string;
  description?: string;
}

export const NODE_TYPES = {
  SOURCE: 'source',
  TRANSFORMATION: 'transformation', 
  SINK: 'sink',
  TABLE: 'table'
} as const;
