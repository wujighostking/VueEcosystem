import type { Plugin } from 'vite'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface Options {
  /**
   *  需要预加载的图片文件夹
   */
  dir: string
  rel?: 'preload' | 'prefetch'
}
export function imagesPrefetch(options: Options): Plugin {
  const { dir, rel = 'preload' } = options
  const assetsImages: string[] = []

  const images = fs.readdirSync(dir)
    .filter(file => /\.(?:jpg|jpeg|png|gif|svg)$/.test(file))
    .map(file => path.join(dir, file).replaceAll('\\', '/'))

  return {
    name: 'vite-plugin-prefetch-images',
    transformIndexHtml(_, ctx) {
      let _images: string[]
      ctx.server ? (_images = images) : (_images = assetsImages)

      return _images.map((file) => {
        return {
          tag: 'link',
          attrs: {
            as: 'image',
            rel,
            href: file,
          },
        }
      })
    },
    generateBundle(_, bundle) {
      const values = Object.values(bundle)

      values.forEach((item) => {
        if (images.includes(Reflect.get(item, 'originalFileName'))) {
          assetsImages.push(item.fileName)
        }
      })
    },
  }
}
