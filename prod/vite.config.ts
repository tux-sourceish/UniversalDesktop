import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Production optimizations
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Feature chunks
          'hooks': [
            './hooks/useCanvasNavigation',
            './hooks/usePanelManager', 
            './hooks/useContextManager',
            './hooks/useWindowManager',
            './hooks/useKeyboardShortcuts',
            './hooks/useAIAgent',
            './hooks/useTerritoryManager',
            './hooks/useClipboardManager',
            './hooks/useMinimap',
            './hooks/useFileManager'
          ],
          
          // Component chunks
          'components': [
            './components/bridges/CanvasController',
            './components/bridges/PanelSidebar',
            './components/bridges/MinimapWidget',
            './components/bridges/FileManagerWindow'
          ],
          
          // Module chunks
          'modules': [
            './modules/AuthModule',
            './modules/DataModule', 
            './modules/CanvasModule',
            './modules/PanelModule',
            './modules/ContextModule'
          ]
        }
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000
  },
  
  // Development server
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@hooks': resolve(__dirname, './hooks'),
      '@components': resolve(__dirname, './components'),
      '@modules': resolve(__dirname, './modules'),
      '@services': resolve(__dirname, './services'),
      '@types': resolve(__dirname, './types'),
      '@styles': resolve(__dirname, './styles')
    }
  },
  
  // Environment variables
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0')
  },
  
  // CSS optimization
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Preview server (for production testing)
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})