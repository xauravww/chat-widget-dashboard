import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define process.env.NODE_ENV for browser compatibility
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  server: {
    cors: true, // Enable CORS for all origins
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'ChatWidget', // The global variable name the library will be exposed as
      formats: ['iife'], // Immediately Invoked Function Expression, suitable for script tags
      fileName: (format) => `chat-widget.${format}.js` // Output filename
    },
    // We don't need Rollup options for splitting chunks or externalizing React for a simple embeddable widget yet.
    // If the widget grows, we might revisit this.
    // rollupOptions: {
    //   external: ['react', 'react-dom'],
    //   output: {
    //     globals: {
    //       react: 'React',
    //       'react-dom': 'ReactDOM'
    //     }
    //   }
    // }
  }
})