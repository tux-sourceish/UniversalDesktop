import React, { useState, useEffect, useCallback } from 'react';
import './PerformanceControlsPanel.css';

// Performance settings interface
interface PerformanceSettings {
  // Token Budget Management
  maxTokensPerRequest: number;
  tokenBudgetLimit: number;
  tokenUsageAlert: number;
  
  // Context Management
  maxContextItems: number;
  contextPruningThreshold: number;
  smartContextPruning: boolean;
  
  // API Efficiency
  requestThrottleMs: number;
  batchRequestsEnabled: boolean;
  cacheResponsesEnabled: boolean;
  
  // Canvas Performance
  maxRenderItems: number;
  viewportCullingEnabled: boolean;
  lowDetailMode: boolean;
  animationQuality: 'low' | 'medium' | 'high';
  
  // Memory Management
  maxMemoryUsage: number;
  autoGarbageCollection: boolean;
  itemCleanupInterval: number;
}

interface PerformanceMetrics {
  currentTokenUsage: number;
  totalRequests: number;
  averageResponseTime: number;
  memoryUsage: number;
  activeContextItems: number;
  renderedItems: number;
  fps: number;
}

interface PerformanceControlsPanelProps {
  visible: boolean;
  onToggle: () => void;
  onSettingsChange: (settings: PerformanceSettings) => void;
  currentMetrics: PerformanceMetrics;
  currentSettings: PerformanceSettings;
}

const DEFAULT_SETTINGS: PerformanceSettings = {
  maxTokensPerRequest: 4096,
  tokenBudgetLimit: 50000,
  tokenUsageAlert: 80,
  maxContextItems: 20,
  contextPruningThreshold: 15,
  smartContextPruning: true,
  requestThrottleMs: 500,
  batchRequestsEnabled: true,
  cacheResponsesEnabled: true,
  maxRenderItems: 500,
  viewportCullingEnabled: true,
  lowDetailMode: false,
  animationQuality: 'high',
  maxMemoryUsage: 512,
  autoGarbageCollection: true,
  itemCleanupInterval: 300000 // 5 minutes
};

export const PerformanceControlsPanel: React.FC<PerformanceControlsPanelProps> = ({
  visible,
  onToggle,
  onSettingsChange,
  currentMetrics,
  currentSettings
}) => {
  const [settings, setSettings] = useState<PerformanceSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'tokens' | 'context' | 'api' | 'canvas' | 'memory'>('tokens');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update settings when props change
  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  // Handle setting changes
  const handleSettingChange = useCallback((key: keyof PerformanceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  }, [settings, onSettingsChange]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    onSettingsChange(DEFAULT_SETTINGS);
  }, [onSettingsChange]);

  // Calculate performance score
  const calculatePerformanceScore = useCallback(() => {
    const tokenScore = (currentMetrics.currentTokenUsage / settings.tokenBudgetLimit) * 100;
    const memoryScore = (currentMetrics.memoryUsage / settings.maxMemoryUsage) * 100;
    const contextScore = (currentMetrics.activeContextItems / settings.maxContextItems) * 100;
    const fpsScore = Math.min(100, (currentMetrics.fps / 60) * 100);
    
    return Math.max(0, 100 - (tokenScore + memoryScore + contextScore + (100 - fpsScore)) / 4);
  }, [currentMetrics, settings]);

  if (!visible) {
    return (
      <div className="performance-controls-toggle">
        <button
          className="sc-performance-toggle-btn"
          onClick={onToggle}
          title="Performance Controls"
        >
          ⚡
        </button>
      </div>
    );
  }

  const performanceScore = calculatePerformanceScore();

  return (
    <div className="performance-controls-panel">
      <div className="sc-performance-header">
        <div className="sc-performance-title">
          <span className="sc-title-text">PERFORMANCE</span>
          <div className="sc-performance-score">
            <span className="sc-score-value">{Math.round(performanceScore)}%</span>
            <span className="sc-score-label">EFFICIENCY</span>
          </div>
        </div>
        <div className="sc-performance-controls">
          <button
            className="sc-control-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            title="Advanced Settings"
          >
            ⚙️
          </button>
          <button
            className="sc-control-btn"
            onClick={resetToDefaults}
            title="Reset to Defaults"
          >
            🔄
          </button>
          <button
            className="sc-control-btn"
            onClick={onToggle}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="sc-performance-tabs">
        {[
          { id: 'tokens', label: 'TOKENS', icon: '🎯' },
          { id: 'context', label: 'CONTEXT', icon: '🔗' },
          { id: 'api', label: 'API', icon: '🌐' },
          { id: 'canvas', label: 'CANVAS', icon: '🎨' },
          { id: 'memory', label: 'MEMORY', icon: '💾' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`sc-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <span className="sc-tab-icon">{tab.icon}</span>
            <span className="sc-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="sc-performance-content">
        {/* Token Management Tab */}
        {activeTab === 'tokens' && (
          <div className="sc-tab-content">
            <div className="sc-metrics-row">
              <div className="sc-metric">
                <span className="sc-metric-value">{currentMetrics.currentTokenUsage.toLocaleString()}</span>
                <span className="sc-metric-label">TOKENS USED</span>
              </div>
              <div className="sc-metric">
                <span className="sc-metric-value">{Math.round((currentMetrics.currentTokenUsage / settings.tokenBudgetLimit) * 100)}%</span>
                <span className="sc-metric-label">BUDGET</span>
              </div>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Max Tokens per Request
                <input
                  type="range"
                  min="1000"
                  max="8192"
                  step="256"
                  value={settings.maxTokensPerRequest}
                  onChange={(e) => handleSettingChange('maxTokensPerRequest', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.maxTokensPerRequest.toLocaleString()}</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Token Budget Limit
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={settings.tokenBudgetLimit}
                  onChange={(e) => handleSettingChange('tokenBudgetLimit', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.tokenBudgetLimit.toLocaleString()}</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Usage Alert Threshold (%)
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.tokenUsageAlert}
                  onChange={(e) => handleSettingChange('tokenUsageAlert', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.tokenUsageAlert}%</span>
              </label>
            </div>
          </div>
        )}

        {/* Context Management Tab */}
        {activeTab === 'context' && (
          <div className="sc-tab-content">
            <div className="sc-metrics-row">
              <div className="sc-metric">
                <span className="sc-metric-value">{currentMetrics.activeContextItems}</span>
                <span className="sc-metric-label">ACTIVE ITEMS</span>
              </div>
              <div className="sc-metric">
                <span className="sc-metric-value">{Math.round((currentMetrics.activeContextItems / settings.maxContextItems) * 100)}%</span>
                <span className="sc-metric-label">CAPACITY</span>
              </div>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Max Context Items
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={settings.maxContextItems}
                  onChange={(e) => handleSettingChange('maxContextItems', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.maxContextItems}</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Pruning Threshold
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={settings.contextPruningThreshold}
                  onChange={(e) => handleSettingChange('contextPruningThreshold', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.contextPruningThreshold}</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.smartContextPruning}
                  onChange={(e) => handleSettingChange('smartContextPruning', e.target.checked)}
                  className="sc-checkbox"
                />
                <span className="sc-checkbox-text">Smart Context Pruning</span>
              </label>
            </div>
          </div>
        )}

        {/* API Efficiency Tab */}
        {activeTab === 'api' && (
          <div className="sc-tab-content">
            <div className="sc-metrics-row">
              <div className="sc-metric">
                <span className="sc-metric-value">{currentMetrics.totalRequests}</span>
                <span className="sc-metric-label">REQUESTS</span>
              </div>
              <div className="sc-metric">
                <span className="sc-metric-value">{Math.round(currentMetrics.averageResponseTime)}ms</span>
                <span className="sc-metric-label">AVG TIME</span>
              </div>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Request Throttle (ms)
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.requestThrottleMs}
                  onChange={(e) => handleSettingChange('requestThrottleMs', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.requestThrottleMs}ms</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.batchRequestsEnabled}
                  onChange={(e) => handleSettingChange('batchRequestsEnabled', e.target.checked)}
                  className="sc-checkbox"
                />
                <span className="sc-checkbox-text">Batch Requests</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.cacheResponsesEnabled}
                  onChange={(e) => handleSettingChange('cacheResponsesEnabled', e.target.checked)}
                  className="sc-checkbox"
                />
                <span className="sc-checkbox-text">Cache Responses</span>
              </label>
            </div>
          </div>
        )}

        {/* Canvas Performance Tab */}
        {activeTab === 'canvas' && (
          <div className="sc-tab-content">
            <div className="sc-metrics-row">
              <div className="sc-metric">
                <span className="sc-metric-value">{currentMetrics.renderedItems}</span>
                <span className="sc-metric-label">RENDERED</span>
              </div>
              <div className="sc-metric">
                <span className="sc-metric-value">{Math.round(currentMetrics.fps)}</span>
                <span className="sc-metric-label">FPS</span>
              </div>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Max Render Items
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.maxRenderItems}
                  onChange={(e) => handleSettingChange('maxRenderItems', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.maxRenderItems}</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Animation Quality
                <select
                  value={settings.animationQuality}
                  onChange={(e) => handleSettingChange('animationQuality', e.target.value)}
                  className="sc-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.viewportCullingEnabled}
                  onChange={(e) => handleSettingChange('viewportCullingEnabled', e.target.checked)}
                  className="sc-checkbox"
                />
                <span className="sc-checkbox-text">Viewport Culling</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.lowDetailMode}
                  onChange={(e) => handleSettingChange('lowDetailMode', e.target.checked)}
                  className="sc-checkbox"
                />
                <span className="sc-checkbox-text">Low Detail Mode</span>
              </label>
            </div>
          </div>
        )}

        {/* Memory Management Tab */}
        {activeTab === 'memory' && (
          <div className="sc-tab-content">
            <div className="sc-metrics-row">
              <div className="sc-metric">
                <span className="sc-metric-value">{Math.round(currentMetrics.memoryUsage)}MB</span>
                <span className="sc-metric-label">USAGE</span>
              </div>
              <div className="sc-metric">
                <span className="sc-metric-value">{Math.round((currentMetrics.memoryUsage / settings.maxMemoryUsage) * 100)}%</span>
                <span className="sc-metric-label">CAPACITY</span>
              </div>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Max Memory Usage (MB)
                <input
                  type="range"
                  min="128"
                  max="2048"
                  step="64"
                  value={settings.maxMemoryUsage}
                  onChange={(e) => handleSettingChange('maxMemoryUsage', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{settings.maxMemoryUsage}MB</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-setting-label">
                Cleanup Interval (minutes)
                <input
                  type="range"
                  min="60000"
                  max="1800000"
                  step="60000"
                  value={settings.itemCleanupInterval}
                  onChange={(e) => handleSettingChange('itemCleanupInterval', parseInt(e.target.value))}
                  className="sc-slider"
                />
                <span className="sc-setting-value">{Math.round(settings.itemCleanupInterval / 60000)}min</span>
              </label>
            </div>
            
            <div className="sc-setting-group">
              <label className="sc-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoGarbageCollection}
                  onChange={(e) => handleSettingChange('autoGarbageCollection', e.target.checked)}
                  className="sc-checkbox"
                />
                <span className="sc-checkbox-text">Auto Garbage Collection</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Performance Recommendations */}
      <div className="sc-performance-recommendations">
        <div className="sc-recommendations-header">
          <span className="sc-recommendations-title">RECOMMENDATIONS</span>
        </div>
        <div className="sc-recommendations-list">
          {performanceScore < 70 && (
            <div className="sc-recommendation warning">
              <span className="sc-rec-icon">⚠️</span>
              <span className="sc-rec-text">Performance below optimal - consider reducing token budget or context items</span>
            </div>
          )}
          {currentMetrics.fps < 30 && (
            <div className="sc-recommendation error">
              <span className="sc-rec-icon">🚨</span>
              <span className="sc-rec-text">Low FPS detected - enable viewport culling or reduce render items</span>
            </div>
          )}
          {currentMetrics.memoryUsage > settings.maxMemoryUsage * 0.8 && (
            <div className="sc-recommendation warning">
              <span className="sc-rec-icon">💾</span>
              <span className="sc-rec-text">High memory usage - consider enabling auto garbage collection</span>
            </div>
          )}
          {performanceScore >= 85 && (
            <div className="sc-recommendation success">
              <span className="sc-rec-icon">✅</span>
              <span className="sc-rec-text">Excellent performance - system running optimally</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceControlsPanel;