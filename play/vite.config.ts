import { fileURLToPath } from 'node:url'
import { imageFallback, imagesPrefetch } from '@vitejs/plugin-image'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), imageFallback({
    defaultImgUrl: 'src/assets/image10.jpg',
    // defaultImgUrl: 'https://img2.baidu.com/it/u=3018303209,1765139986&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=722',
  }), imagesPrefetch()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },

  },
})
