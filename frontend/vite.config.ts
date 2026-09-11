import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: "http://localhost:8080",
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动分割chunk
        manualChunks: {
          // React核心库
          'react-vendor': ['react', 'react-dom'],
          // ECharts图表库
          'echarts-vendor': ['echarts', 'echarts-for-react'],
        },
        // chunk文件名格式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 使用esbuild压缩（更快，无需额外依赖）
    minify: 'esbuild',
    // 分包阈值
    chunkSizeWarningLimit: 500,
  },
})
