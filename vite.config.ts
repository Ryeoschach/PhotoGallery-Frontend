import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // 或者 @vitejs/plugin-react

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 字符串简写写法
      // '/api': 'http://127.0.0.1:8000',
      // 选项写法
      '/api': {
        target: 'http://127.0.0.1:8000', // 你的 Django 后端地址
        changeOrigin: true, // 需要虚拟主机站点
        // 可选：如果你不想在请求 Django 时传递 /api 前缀
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
