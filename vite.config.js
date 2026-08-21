import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          // Mặc định theo API HTTPS; có thể chuyển sang HTTP fallback bằng .env.local.
          target: env.VITE_API_TARGET || 'https://localhost:7023',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
