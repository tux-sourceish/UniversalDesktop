import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    //allowedHosts: ['p73-klapprechner']
    port: 5173,
    host: true,
    open: false,
    fs: {
      allow: ['/home/tux/SingularUniverse/opt/UniversalFile', '/home/tux/SingularUniverse/opt/UniversalDesktop']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'production',
    // Suppress rollup warnings for vendor source maps
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'canvas-module': ['./src/modules/μ8_CanvasModule.tsx'],
          'panel-module': ['./src/modules/μ2_PanelModule.tsx'],
          'file-manager-window': ['./src/components/windows/μ2_FileManagerWindow.tsx']
        }
      },
      onwarn(warning, warn) {
        if (warning.code === 'SOURCEMAP_ERROR') return;
        warn(warning);
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Fix source map errors completely - NUCLEAR OPTION
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
    // Force no source maps for dependencies
    esbuildOptions: {
      sourcemap: false
    }
  },
  // Disable ALL source maps in development
  css: {
    devSourcemap: false
  }
})
