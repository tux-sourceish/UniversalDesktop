import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'production',
    // Suppress rollup warnings for vendor source maps
    rollupOptions: {
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