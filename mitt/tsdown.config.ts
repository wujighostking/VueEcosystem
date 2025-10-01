import { defineConfig } from 'tsdown'

export default defineConfig({
  platform: 'neutral',
  entry: './src/index.ts',
  format: 'esm',
  watch: './src',
})
