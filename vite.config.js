import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index-app.html',
        widget: './widget.html',
        central: './central.html'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'widget' ? 'widget.js' : 'assets/[name]-[hash].js'
        },
        // Asegurar que los chunks del widget sean accesibles via CORS
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('widget')) {
            return 'widget-[hash].js'
          }
          return 'assets/[name]-[hash].js'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.includes('chatbot')) {
            return 'widget-styles-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Configuración específica para el widget
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantener console.log para debugging
        drop_debugger: true
      }
    },
    // Asegurar que los sourcemaps estén disponibles para debugging
    sourcemap: true
  },
  define: {
    'process.env': {},
    // Agregar información de versión para el widget
    '__WIDGET_VERSION__': JSON.stringify('1.0.0'),
    '__BUILD_DATE__': JSON.stringify(new Date().toISOString())
  },
  // Configuración para desarrollo local
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  // Configuración para preview
  preview: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
})