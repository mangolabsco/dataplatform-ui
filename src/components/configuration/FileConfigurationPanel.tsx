import React, { useState } from 'react';
import { Folder, FileText, Upload, Download, Settings, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { ModuleParameter } from '../../types/modules';

interface FileConfigurationPanelProps {
  parameters: ModuleParameter[];
  configuration: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

type FileFormat = 'csv' | 'json' | 'xml' | 'excel' | 'parquet' | 'txt' | 'jsonl';
type FileSource = 'local' | 's3' | 'ftp' | 'sftp' | 'http' | 'google_drive';

const FileConfigurationPanel: React.FC<FileConfigurationPanelProps> = ({
  parameters,
  configuration,
  onChange,
  errors = {}
}) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [testingFile, setTestingFile] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const fileSource = configuration.file_source || 'local';
  const fileFormat = configuration.file_format || 'csv';
  const filePath = configuration.file_path || '';

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

  const fileFormatOptions = [
    { value: 'csv', label: 'CSV', icon: <FileText className="w-4 h-4" />, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', icon: <FileText className="w-4 h-4" />, description: 'JavaScript Object Notation' },
    { value: 'jsonl', label: 'JSON Lines', icon: <FileText className="w-4 h-4" />, description: 'Line-delimited JSON' },
    { value: 'xml', label: 'XML', icon: <FileText className="w-4 h-4" />, description: 'Extensible Markup Language' },
    { value: 'excel', label: 'Excel', icon: <FileText className="w-4 h-4" />, description: 'Excel spreadsheet (.xlsx, .xls)' },
    { value: 'parquet', label: 'Parquet', icon: <FileText className="w-4 h-4" />, description: 'Columnar storage format' },
    { value: 'txt', label: 'Text', icon: <FileText className="w-4 h-4" />, description: 'Plain text file' },
  ];

  const fileSourceOptions = [
    { value: 'local', label: 'Local File System', icon: <Folder className="w-4 h-4" /> },
    { value: 's3', label: 'Amazon S3', icon: <Upload className="w-4 h-4" /> },
    { value: 'ftp', label: 'FTP', icon: <Download className="w-4 h-4" /> },
    { value: 'sftp', label: 'SFTP', icon: <Download className="w-4 h-4" /> },
    { value: 'http', label: 'HTTP/HTTPS', icon: <Download className="w-4 h-4" /> },
    { value: 'google_drive', label: 'Google Drive', icon: <Upload className="w-4 h-4" /> },
  ];

  const validateFile = async () => {
    if (!filePath) {
      setValidationStatus('error');
      setValidationMessage('Please provide a file path');
      return;
    }

    setTestingFile(true);
    setValidationStatus('idle');
    setPreviewData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/files/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_source: fileSource,
          file_path: filePath,
          file_format: fileFormat,
          connection_config: getConnectionConfig(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        setValidationStatus('success');
        setValidationMessage(`File validated successfully (${result.size} bytes, ${result.rows} rows)`);
        setPreviewData(result.preview);
      } else {
        setValidationStatus('error');
        setValidationMessage(result.message || 'File validation failed');
      }
    } catch (error) {
      setValidationStatus('error');
      setValidationMessage('Failed to validate file');
    } finally {
      setTestingFile(false);
    }
  };

  const getConnectionConfig = () => {
    switch (fileSource) {
      case 's3':
        return {
          access_key: configuration.s3_access_key,
          secret_key: configuration.s3_secret_key,
          bucket: configuration.s3_bucket,
          region: configuration.s3_region,
        };
      case 'ftp':
      case 'sftp':
        return {
          host: configuration.ftp_host,
          port: configuration.ftp_port,
          username: configuration.ftp_username,
          password: configuration.ftp_password,
        };
      case 'http':
        return {
          headers: configuration.http_headers || {},
          auth: configuration.http_auth,
        };
      case 'google_drive':
        return {
          credentials: configuration.google_credentials,
          folder_id: configuration.google_folder_id,
        };
      default:
        return {};
    }
  };

  const renderFileSourceConfiguration = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">File Source</h4>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {fileSourceOptions.map(source => (
          <button
            key={source.value}
            type="button"
            onClick={() => onChange('file_source', source.value)}
            className={`p-3 border-2 rounded-lg text-left transition-colors ${
              fileSource === source.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              {source.icon}
              <span className="ml-2 text-sm font-medium">{source.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderFileFormatConfiguration = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">File Format</h4>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {fileFormatOptions.map(format => (
          <button
            key={format.value}
            type="button"
            onClick={() => onChange('file_format', format.value)}
            className={`p-3 border-2 rounded-lg text-left transition-colors ${
              fileFormat === format.value
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              {format.icon}
              <div className="ml-2">
                <div className="text-sm font-medium">{format.label}</div>
                <div className="text-xs text-gray-500 mt-1">{format.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPathConfiguration = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">File Path</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Path <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={filePath}
            onChange={(e) => onChange('file_path', e.target.value)}
            placeholder={getPathPlaceholder()}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
              errors.file_path ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {getPathHelp()}
        </p>
        {errors.file_path && (
          <p className="text-xs text-red-500 mt-1">{errors.file_path}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Validate your file path and preview the data structure
        </div>
        <button
          type="button"
          onClick={validateFile}
          disabled={testingFile || !filePath}
          className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${testingFile ? 'animate-spin' : ''}`} />
          {testingFile ? 'Validating...' : 'Validate File'}
        </button>
      </div>

      {validationStatus !== 'idle' && (
        <div className={`p-3 border rounded-md ${
          validationStatus === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {validationStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-2 text-sm ${
              validationStatus === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationMessage}
            </span>
          </div>
          
          {previewData && (
            <div className="mt-3">
              <details>
                <summary className="cursor-pointer text-xs font-medium text-gray-700 flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Data Preview ({previewData.length} rows)
                </summary>
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        {previewData[0] && Object.keys(previewData[0]).map((col: string) => (
                          <th key={col} className="text-left py-1 px-2 font-medium text-gray-700 border-b">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row: any, index: number) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, colIndex: number) => (
                            <td key={colIndex} className="py-1 px-2 text-gray-600 border-b">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const getPathPlaceholder = () => {
    switch (fileSource) {
      case 'local':
        return '/path/to/file.csv';
      case 's3':
        return 'path/to/file.csv';
      case 'ftp':
      case 'sftp':
        return '/remote/path/to/file.csv';
      case 'http':
        return 'https://example.com/data.csv';
      case 'google_drive':
        return 'file_name.csv';
      default:
        return 'file.csv';
    }
  };

  const getPathHelp = () => {
    switch (fileSource) {
      case 'local':
        return 'Absolute path to the file on the local file system';
      case 's3':
        return 'Key path in the S3 bucket (without bucket name)';
      case 'ftp':
      case 'sftp':
        return 'Path to the file on the remote server';
      case 'http':
        return 'Full URL to the file';
      case 'google_drive':
        return 'File name or ID in Google Drive';
      default:
        return 'Path to the file';
    }
  };

  const renderConnectionConfiguration = () => {
    switch (fileSource) {
      case 's3':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">AWS S3 Configuration</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID</label>
                <input
                  type="text"
                  value={configuration.s3_access_key || ''}
                  onChange={(e) => onChange('s3_access_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key</label>
                <input
                  type="password"
                  value={configuration.s3_secret_key || ''}
                  onChange={(e) => onChange('s3_secret_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
                <input
                  type="text"
                  value={configuration.s3_bucket || ''}
                  onChange={(e) => onChange('s3_bucket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={configuration.s3_region || 'us-east-1'}
                  onChange={(e) => onChange('s3_region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'ftp':
      case 'sftp':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">
              {fileSource.toUpperCase()} Configuration
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input
                  type="text"
                  value={configuration.ftp_host || ''}
                  onChange={(e) => onChange('ftp_host', e.target.value)}
                  placeholder="ftp.example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={configuration.ftp_port || (fileSource === 'ftp' ? 21 : 22)}
                  onChange={(e) => onChange('ftp_port', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={configuration.ftp_username || ''}
                  onChange={(e) => onChange('ftp_username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={configuration.ftp_password || ''}
                  onChange={(e) => onChange('ftp_password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormatSpecificOptions = () => {
    switch (fileFormat) {
      case 'csv':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">CSV Options</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
                <select
                  value={configuration.csv_delimiter || ','}
                  onChange={(e) => onChange('csv_delimiter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Character</label>
                <select
                  value={configuration.csv_quote || '"'}
                  onChange={(e) => onChange('csv_quote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value='"'>Double Quote (")</option>
                  <option value="'">Single Quote (')</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encoding</label>
                <select
                  value={configuration.csv_encoding || 'utf-8'}
                  onChange={(e) => onChange('csv_encoding', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="latin1">Latin-1</option>
                  <option value="cp1252">Windows-1252</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.csv_has_header !== false}
                  onChange={(e) => onChange('csv_has_header', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">First row contains headers</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.csv_skip_blank_lines !== false}
                  onChange={(e) => onChange('csv_skip_blank_lines', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Skip blank lines</span>
              </label>
            </div>
          </div>
        );

      case 'excel':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Excel Options</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sheet Name</label>
                <input
                  type="text"
                  value={configuration.excel_sheet || ''}
                  onChange={(e) => onChange('excel_sheet', e.target.value)}
                  placeholder="Sheet1 (leave empty for first sheet)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Header Row</label>
                <input
                  type="number"
                  value={configuration.excel_header_row || 0}
                  onChange={(e) => onChange('excel_header_row', Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'json':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">JSON Options</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JSON Path</label>
              <input
                type="text"
                value={configuration.json_path || '$'}
                onChange={(e) => onChange('json_path', e.target.value)}
                placeholder="$.data or $.results"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                JSONPath expression to extract array data from JSON
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderFileSourceConfiguration()}
      {renderFileFormatConfiguration()}
      {renderPathConfiguration()}
      {renderConnectionConfiguration()}
      {renderFormatSpecificOptions()}
      
      {/* Additional parameters not covered by the specialized UI */}
      {parameters
        .filter(param => ![
          'file_source', 'file_format', 'file_path', 's3_access_key', 's3_secret_key', 's3_bucket', 's3_region',
          'ftp_host', 'ftp_port', 'ftp_username', 'ftp_password', 'csv_delimiter', 'csv_quote', 'csv_encoding',
          'csv_has_header', 'csv_skip_blank_lines', 'excel_sheet', 'excel_header_row', 'json_path'
        ].includes(param.name))
        .map(param => {
          const value = configuration[param.name] ?? param.default ?? '';
          const error = errors[param.name];
          
          return (
            <div key={param.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {param.label} {param.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={param.type === 'password' ? 'password' : 'text'}
                value={value}
                onChange={(e) => onChange(param.name, e.target.value)}
                placeholder={param.placeholder}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {param.help && (
                <p className="text-xs text-gray-500 mt-1">{param.help}</p>
              )}
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default FileConfigurationPanel;
