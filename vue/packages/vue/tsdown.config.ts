import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: './dist',
  // 将 @vue/* 内部包内联进产物，使 dist/index.js 自包含，
  // 以便 examples/*.html 可在浏览器中直接以原生 ESM 运行（裸模块名浏览器无法解析）
  noExternal: [/^@vue\//],
})
