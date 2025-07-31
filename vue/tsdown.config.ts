import type { Options } from 'tsdown'
import * as fs from 'node:fs'
import { defineConfig } from 'tsdown'

function setConfig() {
  const config: Options[] = []
  fs.readdirSync('./packages').forEach((pkg) => {
    config.push({
      entry: `./packages/${pkg}/src/index.ts`,
      dts: true,
      format: 'esm',
      clean: true,
      sourcemap: true,
      watch: `./packages/${pkg}/src`,
      outDir: `./packages/${pkg}/dist`,
    })
  })

  return config
}

export default defineConfig(setConfig())
