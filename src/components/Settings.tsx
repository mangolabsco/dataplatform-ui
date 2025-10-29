import React, { useState } from 'react';
import { 
  Monitor, 
  Sun, 
  Moon, 
  Info, 
  Zap, 
  Database, 
  Clock, 
  Bell, 
  Shield, 
  HardDrive,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface SettingsProps {
  onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { theme, setTheme } = useTheme();
  
  // Application settings state
  const [settings, setSettings] = useState({
    // Workflow execution settings
    maxConcurrentWorkflows: 5,
    defaultTimeout: 30,
    retryAttempts: 3,
    autoSaveInterval: 300, // seconds
    
    // System preferences
    enableNotifications: true,
    enableAutoUpdates: false,
    debugMode: false,
    performanceMode: false,
    
    // Data retention
    logRetentionDays: 30,
    cacheRetentionHours: 24,
    tempFileCleanupHours: 1,
    
    // API settings
    apiTimeout: 30,
    rateLimitPerMinute: 100,
    enableCompression: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend or localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to default values
      setSettings({
        maxConcurrentWorkflows: 5,
        defaultTimeout: 30,
        retryAttempts: 3,
        autoSaveInterval: 300,
        enableNotifications: true,
        enableAutoUpdates: false,
        debugMode: false,
        performanceMode: false,
        logRetentionDays: 30,
        cacheRetentionHours: 24,
        tempFileCleanupHours: 1,
        apiTimeout: 30,
        rateLimitPerMinute: 100,
        enableCompression: true
      });
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Data Platform experience and configure application behavior.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Choose how the Data Platform looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = theme === option.value;
                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => setTheme(option.value as any)}
                        className="justify-start h-auto p-4"
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        <span>{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground">
                  System theme will automatically switch between light and dark based on your device settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Application Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Version</Label>
                  <p className="font-medium">1.0.0-beta</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Build</Label>
                  <p className="font-medium">2024.03.15</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Environment</Label>
                  <p className="font-medium">Development</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Node Version</Label>
                  <p className="font-medium">v18.17.0</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Data Platform is a visual workflow builder for data processing pipelines. 
                  Create, deploy, and monitor complex data transformations with an intuitive drag-and-drop interface.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Execution Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Workflow Execution
              </CardTitle>
              <CardDescription>
                Configure how workflows are executed and managed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrent">Max Concurrent Workflows</Label>
                  <Input
                    id="maxConcurrent"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.maxConcurrentWorkflows}
                    onChange={(e) => handleSettingChange('maxConcurrentWorkflows', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of workflows that can run simultaneously</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeout">Default Timeout (minutes)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1"
                    max="120"
                    value={settings.defaultTimeout}
                    onChange={(e) => handleSettingChange('defaultTimeout', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Default execution timeout for workflows</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">Retry Attempts</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    min="0"
                    max="10"
                    value={settings.retryAttempts}
                    onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Number of retry attempts for failed workflows</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoSave">Auto-save Interval (seconds)</Label>
                  <Input
                    id="autoSave"
                    type="number"
                    min="60"
                    max="3600"
                    value={settings.autoSaveInterval}
                    onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">How often to auto-save workflow changes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                General system behavior and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Enable Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive browser notifications for workflow events</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Auto Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">Automatically update the application when available</p>
                  </div>
                  <Switch
                    checked={settings.enableAutoUpdates}
                    onCheckedChange={(checked) => handleSettingChange('enableAutoUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Debug Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable detailed logging and error information</p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Performance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">Optimize for performance over visual effects</p>
                  </div>
                  <Switch
                    checked={settings.performanceMode}
                    onCheckedChange={(checked) => handleSettingChange('performanceMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Configure data retention and cleanup policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.logRetentionDays}
                    onChange={(e) => handleSettingChange('logRetentionDays', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">How long to keep execution logs</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cacheRetention">Cache Retention (hours)</Label>
                  <Input
                    id="cacheRetention"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.cacheRetentionHours}
                    onChange={(e) => handleSettingChange('cacheRetentionHours', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">How long to keep cached data</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tempCleanup">Temp File Cleanup (hours)</Label>
                  <Input
                    id="tempCleanup"
                    type="number"
                    min="1"
                    max="24"
                    value={settings.tempFileCleanupHours}
                    onChange={(e) => handleSettingChange('tempFileCleanupHours', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">How often to clean up temporary files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure API behavior and rate limiting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                  <Input
                    id="apiTimeout"
                    type="number"
                    min="5"
                    max="300"
                    value={settings.apiTimeout}
                    onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Timeout for API requests</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => handleSettingChange('rateLimitPerMinute', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Maximum API requests per minute</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Compression</Label>
                  <p className="text-sm text-muted-foreground">Compress API responses to reduce bandwidth</p>
                </div>
                <Switch
                  checked={settings.enableCompression}
                  onCheckedChange={(checked) => handleSettingChange('enableCompression', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Save Configuration</p>
                  <p className="text-sm text-muted-foreground">Save your current settings or reset to defaults.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleResetSettings}>
                    Reset to Defaults
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
