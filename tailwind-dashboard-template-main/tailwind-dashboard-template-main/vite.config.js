import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],

  server: {
    proxy: {
      '/balaji-finance': {
        target: 'http://localhost:8881',
        changeOrigin: true,
      },
    },
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
