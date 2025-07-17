/**
 * 🔐 useSupabaseConfig - Intelligent Supabase Configuration Hook
 * 
 * Automatically detects environment and provides correct Supabase configuration.
 * Handles development, staging, and production environments seamlessly.
 */

import { useState, useEffect, useCallback } from 'react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  environment: 'development' | 'staging' | 'production';
  isValid: boolean;
}

interface SupabaseConfigReturn {
  config: SupabaseConfig;
  loading: boolean;
  error: string | null;
  validateConfig: () => boolean;
  setCustomConfig: (url: string, key: string) => void;
}

export const useSupabaseConfig = (): SupabaseConfigReturn => {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    environment: 'development',
    isValid: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Environment detection
  const detectEnvironment = useCallback((): 'development' | 'staging' | 'production' => {
    const hostname = window.location.hostname;
    
    if (hostname === 'ullrichbau.app' || hostname.includes('ullrichbau')) {
      return 'production';
    }
    
    if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    }
    
    return 'development';
  }, []);

  // Default configurations for different environments
  const getDefaultConfig = useCallback((env: 'development' | 'staging' | 'production') => {
    const configs = {
      development: {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key',
        fallbackUrl: 'https://demo.supabase.co',
        fallbackKey: 'demo-key'
      },
      staging: {
        url: 'https://staging-project.supabase.co',
        anonKey: 'staging-anon-key',
        fallbackUrl: 'https://demo.supabase.co',
        fallbackKey: 'demo-key'
      },
      production: {
        url: 'https://ullrichbau-project.supabase.co',
        anonKey: 'production-anon-key',
        fallbackUrl: 'https://demo.supabase.co',
        fallbackKey: 'demo-key'
      }
    };
    
    return configs[env];
  }, []);

  // Validate Supabase URL format
  const validateSupabaseUrl = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && 
             (urlObj.hostname.includes('supabase.co') || 
              urlObj.hostname.includes('supabase.com') ||
              urlObj.hostname === 'localhost' ||
              urlObj.hostname.includes('ullrichbau'));
    } catch {
      return false;
    }
  }, []);

  // Validate configuration
  const validateConfig = useCallback((): boolean => {
    if (!config.url || !config.anonKey) {
      setError('Supabase URL and anonymous key are required');
      return false;
    }

    if (!validateSupabaseUrl(config.url)) {
      setError('Invalid Supabase URL format');
      return false;
    }

    if (config.anonKey.length < 20) {
      setError('Invalid anonymous key format');
      return false;
    }

    setError(null);
    return true;
  }, [config, validateSupabaseUrl]);

  // Initialize configuration
  const initializeConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const environment = detectEnvironment();
      const defaultConfig = getDefaultConfig(environment);

      // Check for environment variables
      const envUrl = import.meta.env.VITE_SUPABASE_URL;
      const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      let finalUrl = envUrl || defaultConfig.url;
      let finalKey = envKey || defaultConfig.anonKey;

      // Fallback for development if main config fails
      if (!validateSupabaseUrl(finalUrl)) {
        console.warn('🔧 Using fallback Supabase configuration for development');
        finalUrl = defaultConfig.fallbackUrl;
        finalKey = defaultConfig.fallbackKey;
      }

      const newConfig: SupabaseConfig = {
        url: finalUrl,
        anonKey: finalKey,
        environment,
        isValid: validateSupabaseUrl(finalUrl) && finalKey.length > 20
      };

      setConfig(newConfig);

      // Log configuration status
      console.log(`🔐 Supabase Configuration:`, {
        environment,
        url: finalUrl,
        keyLength: finalKey.length,
        isValid: newConfig.isValid
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Supabase config');
      
      // Emergency fallback configuration
      setConfig({
        url: 'https://demo.supabase.co',
        anonKey: 'demo-key-for-development',
        environment: 'development',
        isValid: false
      });
    } finally {
      setLoading(false);
    }
  }, [detectEnvironment, getDefaultConfig, validateSupabaseUrl]);

  // Set custom configuration
  const setCustomConfig = useCallback((url: string, key: string) => {
    const newConfig: SupabaseConfig = {
      url,
      anonKey: key,
      environment: config.environment,
      isValid: validateSupabaseUrl(url) && key.length > 20
    };

    setConfig(newConfig);
    
    if (newConfig.isValid) {
      setError(null);
    } else {
      setError('Invalid custom configuration');
    }
  }, [config.environment, validateSupabaseUrl]);

  // Initialize on mount
  useEffect(() => {
    initializeConfig();
  }, [initializeConfig]);

  return {
    config,
    loading,
    error,
    validateConfig,
    setCustomConfig
  };
};