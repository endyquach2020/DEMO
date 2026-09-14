import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Dùng đường dẫn tương đối để chạy chuẩn trên mọi thư mục GitHub Pages
})
