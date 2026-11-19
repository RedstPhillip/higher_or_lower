import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // damit wir '@/stores/...' schreiben können (wie im Unterricht)
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
