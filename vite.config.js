import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin personalizado para copiar widget.js
    {
      name: 'copy-widget',
      writeBundle() {
        try {
          // Asegurar que existe el directorio dist
          mkdirSync('./dist', { recursive: true });
          // Copiar widget.js a dist
          copyFileSync('./widget.js', './dist/widget.js');
          console.log('✅ widget.js copiado a dist/');
        } catch (error) {
          console.warn('⚠️ Error copiando widget.js:', error.message);
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        central: './central.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
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