import { ModuleParameter } from '../types/modules';

/**
 * Result object returned by validation functions.
 * Contains validation status, error messages, and optional warnings.
 * 
 * @interface ValidationResult
 */
export interface ValidationResult {
  /** Whether the validation passed without errors */
  isValid: boolean;
  /** Map of parameter names to error messages */
  errors: Record<string, string>;
  /** Optional map of parameter names to warning messages */
  warnings?: Record<string, string>;
}

/**
 * Result object returned by connection testing functions.
 * Contains connection test status and details about the result.
 * 
 * @interface TestConnectionResult
 */
export interface TestConnectionResult {
  /** Whether the connection test was successful */
  success: boolean;
  /** Human-readable message describing the result */
  message: string;
  /** Optional additional details about the test (e.g., data preview) */
  details?: any;
  /** HTTP status code returned by the connection test */
  statusCode?: number;
}

/**
 * Validates module configuration values against their parameter definitions.
 * Performs comprehensive validation including required fields, data types,
 * value constraints, and custom validation rules.
 * 
 * @param {ModuleParameter[]} parameters - Array of parameter definitions to validate against
 * @param {Record<string, any>} configuration - Configuration object with parameter values
 * @returns {ValidationResult} Validation result containing errors and warnings
 * 
 * @example
 * ```typescript
 * const result = validateModuleConfiguration(
 *   [{ name: 'port', type: 'number', required: true, validation: { min: 1, max: 65535 } }],
 *   { port: 3306 }
 * );
 * if (result.isValid) {
 *   // Configuration is valid
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateModuleConfiguration(
  parameters: ModuleParameter[],
  configuration: Record<string, any>
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  parameters.forEach(param => {
    const value = configuration[param.name];
    
    // Check required fields
    if (param.required && (value === undefined || value === null || value === '')) {
      errors[param.name] = `${param.label} is required`;
      return;
    }

    // Skip validation if value is empty and not required
    if (!param.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // Type-specific validation
    switch (param.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors[param.name] = `${param.label} must be a valid number`;
        } else {
          const numValue = Number(value);
          if (param.validation?.min !== undefined && numValue < param.validation.min) {
            errors[param.name] = `${param.label} must be at least ${param.validation.min}`;
          }
          if (param.validation?.max !== undefined && numValue > param.validation.max) {
            errors[param.name] = `${param.label} must be at most ${param.validation.max}`;
          }
        }
        break;

      case 'text':
      case 'password':
        if (typeof value !== 'string') {
          errors[param.name] = `${param.label} must be a string`;
        } else {
          if (param.validation?.min !== undefined && value.length < param.validation.min) {
            errors[param.name] = `${param.label} must be at least ${param.validation.min} characters`;
          }
          if (param.validation?.max !== undefined && value.length > param.validation.max) {
            errors[param.name] = `${param.label} must be at most ${param.validation.max} characters`;
          }
          if (param.validation?.pattern) {
            const regex = new RegExp(param.validation.pattern);
            if (!regex.test(value)) {
              errors[param.name] = `${param.label} format is invalid`;
            }
          }
        }
        break;

      case 'select':
        if (param.options && !param.options.includes(value)) {
          errors[param.name] = `${param.label} must be one of: ${param.options.join(', ')}`;
        }
        break;

      case 'multi_select':
        if (!Array.isArray(value)) {
          errors[param.name] = `${param.label} must be an array`;
        } else if (param.options) {
          const invalidOptions = value.filter(v => !param.options!.includes(v));
          if (invalidOptions.length > 0) {
            errors[param.name] = `${param.label} contains invalid options: ${invalidOptions.join(', ')}`;
          }
        }
        break;

      case 'json':
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
          } catch {
            errors[param.name] = `${param.label} must be valid JSON`;
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          warnings[param.name] = `${param.label} should be a boolean value`;
        }
        break;
    }

    // Custom validation
    if (param.validation?.custom) {
      // This could be extended to support custom validation functions
      // For now, we'll just check if it's a known custom validation type
      switch (param.validation.custom) {
        case 'email':
          if (typeof value === 'string' && !isValidEmail(value)) {
            errors[param.name] = `${param.label} must be a valid email address`;
          }
          break;
        case 'url':
          if (typeof value === 'string' && !isValidUrl(value)) {
            errors[param.name] = `${param.label} must be a valid URL`;
          }
          break;
        case 'ip_address':
          if (typeof value === 'string' && !isValidIpAddress(value)) {
            errors[param.name] = `${param.label} must be a valid IP address`;
          }
          break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
}

/**
 * Tests database connection using the provided configuration.
 * Sends a request to the backend API to validate database connectivity,
 * credentials, and basic query functionality.
 * 
 * @param {Record<string, any>} configuration - Database connection configuration
 * @returns {Promise<TestConnectionResult>} Promise resolving to connection test result
 * 
 * @example
 * ```typescript
 * const result = await testDatabaseConnection({
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'pass'
 * });
 * if (result.success) {
 *   console.log('Database connection successful');
 * } else {
 *   console.error('Connection failed:', result.message);
 * }
 * ```
 */
export async function testDatabaseConnection(
  configuration: Record<string, any>
): Promise<TestConnectionResult> {
  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/database/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configuration),
    });

    const result = await response.json();

    return {
      success: response.ok && result.success,
      message: result.message || (response.ok ? 'Connection successful' : 'Connection failed'),
      details: result.details,
      statusCode: response.status
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test connection: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

/**
 * Tests API endpoint accessibility and response using the provided configuration.
 * Validates endpoint URL, authentication, headers, and basic connectivity.
 * 
 * @param {Record<string, any>} configuration - API endpoint configuration
 * @returns {Promise<TestConnectionResult>} Promise resolving to API test result
 * 
 * @example
 * ```typescript
 * const result = await testAPIConnection({
 *   endpoint: 'https://api.example.com/data',
 *   method: 'GET',
 *   headers: { 'Authorization': 'Bearer token123' }
 * });
 * if (result.success) {
 *   console.log('API endpoint accessible:', result.details);
 * }
 * ```
 */
export async function testAPIConnection(
  configuration: Record<string, any>
): Promise<TestConnectionResult> {
  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/test-endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configuration),
    });

    const result = await response.json();

    return {
      success: response.ok && result.success,
      message: result.message || (response.ok ? 'API endpoint accessible' : 'API endpoint failed'),
      details: result.preview || result.details,
      statusCode: result.status_code || response.status
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test API endpoint: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

/**
 * Tests file source accessibility and format validation.
 * Verifies file path, permissions, format compatibility, and basic structure.
 * 
 * @param {Record<string, any>} configuration - File source configuration
 * @returns {Promise<TestConnectionResult>} Promise resolving to file test result
 * 
 * @example
 * ```typescript
 * const result = await testFileSource({
 *   filePath: '/path/to/data.csv',
 *   format: 'csv',
 *   encoding: 'utf-8',
 *   delimiter: ','
 * });
 * if (result.success) {
 *   console.log('File accessible:', result.details);
 * }
 * ```
 */
export async function testFileSource(
  configuration: Record<string, any>
): Promise<TestConnectionResult> {
  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_BASE_URL}/files/test-source`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configuration),
    });

    const result = await response.json();

    return {
      success: response.ok && result.success,
      message: result.message || (response.ok ? 'File source accessible' : 'File source failed'),
      details: result.preview || result.details,
      statusCode: response.status
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test file source: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

/**
 * Generic configuration test that routes to appropriate test function based on module type.
 * Analyzes the module ID to determine the test type and calls the corresponding function.
 * 
 * @param {string} moduleId - Module identifier used to determine test type
 * @param {Record<string, any>} configuration - Module configuration to test
 * @returns {Promise<TestConnectionResult>} Promise resolving to test result
 * 
 * @example
 * ```typescript
 * const result = await testModuleConfiguration('mysql_source', {
 *   host: 'localhost',
 *   port: 3306,
 *   database: 'test'
 * });
 * // Automatically routes to testDatabaseConnection based on 'mysql' in moduleId
 * ```
 */
export async function testModuleConfiguration(
  moduleId: string,
  configuration: Record<string, any>
): Promise<TestConnectionResult> {
  const moduleIdLower = moduleId.toLowerCase();
  
  // Determine test type based on module ID
  if (moduleIdLower.includes('database') || 
      moduleIdLower.includes('mysql') || 
      moduleIdLower.includes('postgresql') || 
      moduleIdLower.includes('sqlite')) {
    return testDatabaseConnection(configuration);
  }
  
  if (moduleIdLower.includes('api') || 
      moduleIdLower.includes('rest') || 
      moduleIdLower.includes('http')) {
    return testAPIConnection(configuration);
  }
  
  if (moduleIdLower.includes('file') || 
      moduleIdLower.includes('csv') || 
      moduleIdLower.includes('json') ||
      moduleIdLower.includes('s3') ||
      moduleIdLower.includes('ftp')) {
    return testFileSource(configuration);
  }
  
  // Generic test - just validate configuration
  return {
    success: true,
    message: 'Configuration appears valid'
  };
}

// Helper validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidIpAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Get suggested default values for common parameter names
 */
export function getDefaultValues(parameters: ModuleParameter[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  parameters.forEach(param => {
    if (param.default !== undefined) {
      defaults[param.name] = param.default;
    } else {
      // Suggest defaults for common parameter names
      switch (param.name.toLowerCase()) {
        case 'port':
          if (param.type === 'number') {
            defaults[param.name] = 5432; // PostgreSQL default
          }
          break;
        case 'timeout':
          if (param.type === 'number') {
            defaults[param.name] = 30; // 30 seconds
          }
          break;
        case 'batch_size':
          if (param.type === 'number') {
            defaults[param.name] = 1000;
          }
          break;
        case 'encoding':
          if (param.type === 'select' && param.options?.includes('utf-8')) {
            defaults[param.name] = 'utf-8';
          }
          break;
        case 'method':
          if (param.type === 'select' && param.options?.includes('GET')) {
            defaults[param.name] = 'GET';
          }
          break;
      }
    }
  });
  
  return defaults;
}
