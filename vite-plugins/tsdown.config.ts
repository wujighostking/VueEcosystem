import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/index.ts', // 入口文件
  format: 'es', // 输出格式 (esm, cjs, iife, umd)
  dts: true,
  clean: true,
})
