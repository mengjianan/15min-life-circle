import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // 相对路径，兼容 GitHub Pages 子目录部署
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // docker-compose 把后端映射到宿主机 8081（容器内 8000）
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimize for production
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'echarts-vendor': ['echarts', 'echarts-for-react'],
        }
      }
    }
  }
})
