import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CSE442/2025-Spring/cse-442s/',
  server: {
    proxy: {
      '/CSE442/2025-Spring/cse-442s/Backend': {
        target: 'http://backend:80',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/CSE442\/2025-Spring\/cse-442s\/Backend/, ''),
      },
    },
  },
})
