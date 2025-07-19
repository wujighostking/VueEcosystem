import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'index.ts', // 入口文件
  format: 'esm', // 输出格式 (esm, cjs, iife, umd)
})
