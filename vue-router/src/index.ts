import type { App, Plugin } from 'vue'

export { createWebHashHistory } from './hash'
export { createWebHistory } from './history'

// eslint-disable-next-line unused-imports/no-unused-vars
export function createRouter(options: any) {
  const router: Plugin = {
    // eslint-disable-next-line unused-imports/no-unused-vars
    install(app: App) {
    },
  }

  return router
}
