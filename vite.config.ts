import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.wasm"],
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
    sourcemap: false,
    // Suppress rollup warnings for vendor source maps
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'canvas-module': ['/home/tux/SingularUniverse/opt/UniversalDesktop/src/modules/μ8_CanvasModule.tsx'],
          'panel-module': ['/home/tux/SingularUniverse/opt/UniversalDesktop/src/modules/μ2_PanelModule.tsx'],
          'file-manager-window': ['/home/tux/SingularUniverse/opt/UniversalDesktop/src/components/windows/μ2_FileManagerWindow.tsx']
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

})
