import type { Plugin } from 'vite'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface Options {
  defaultImgUrl: string
}
export function imageFallback(options: Options): Plugin {
  const { defaultImgUrl } = options
  let dir: string | undefined
  let defaultUrl: string | undefined
  let isDev: boolean | undefined

  return {
    name: 'vite-plugin-image-fallback',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      isDev = resolvedConfig.mode === 'development'
    },

    transform(code: string, id: string) {
      let transformCode = code

      if (/\.vue$/.test(id)) {
        const regex = /<img\b[^>]*>/g
        const imgTags = transformCode.match(regex)

        imgTags?.forEach((tag) => {
          if (tag.includes('onerror'))
            return

          defaultUrl = isDev ? defaultImgUrl : defaultImgUrl.replace('src', '')

          const target = tag.replace('<img', `<img onerror="this.src='${defaultUrl}';this.onerror=null;"`)
          transformCode = transformCode.replace(tag, target)
        })
      }

      return transformCode
    },
    outputOptions(options) {
      dir = options.dir
    },
    closeBundle() {
      if (!defaultImgUrl?.startsWith('src'))
        return

      const basename = path.basename(defaultUrl!)

      const assetsDir = `${dir}\\assets\\${basename}`
      fs.copyFile(defaultImgUrl, assetsDir, (err) => {
        if (err) {
          console.error(err)
        }
      })
    },
  }
}
