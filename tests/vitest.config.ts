/**
 * 🧪 Vitest Configuration for UniversalDesktop v2.1
 * 
 * Optimized for μX-Bagua architecture testing with React components
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,ts,tsx}',
      'src/**/*.{test,spec}.{js,ts,tsx}'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'src/types/',
        '**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'git/',
        '.claude/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 75,
          lines: 80,
          statements: 80,
        },
        // Specific thresholds for critical components
        'src/components/contextMenu/': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/hooks/useFileManager.ts': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/hooks/µ6_useContextManager.ts': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    
    // Performance settings
    testTimeout: 10000,
    hookTimeout: 5000,
    
    // Reporters
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/test-results.json',
      html: './test-results/test-results.html',
    },
    
    // Environment configuration
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
      VITE_LITELLM_BASE_URL: 'https://test-litellm.example.com',
    },
    
    // Advanced options
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.claude',
      'git/',
    ],
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@tests': path.resolve(__dirname, '../tests'),
    },
  },
  
  // Define globals for testing
  define: {
    __TEST__: true,
    __DEV__: false,
  },
});