import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        widget: './widget.html',
        central: './central.html'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'widget' ? 'widget.js' : 'assets/[name]-[hash].js'
        },
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
    target: 'es2015',
    minify: true,
    sourcemap: false
  },
  define: {
    'process.env': {},
    '__WIDGET_VERSION__': JSON.stringify('1.0.0'),
    '__BUILD_DATE__': JSON.stringify(new Date().toISOString())
  },
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  preview: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
})