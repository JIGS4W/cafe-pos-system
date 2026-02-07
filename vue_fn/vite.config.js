import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // เมื่อ React เจอ /api มันจะส่งต่อไปยัง Backend
      '/api': {
        target: 'http://127.0.0.1:8787', // ⚠️ เปลี่ยนเป็น URL ของ Backend คุณ
        changeOrigin: true,
        secure: false,
      }
    }
  }
})