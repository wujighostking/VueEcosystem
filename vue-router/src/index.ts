import type { App, Component, Plugin } from 'vue'
import type { createWebHashHistory } from './hash'

import type { createWebHistory } from './history'
import { h } from 'vue'
import { createRouterMatcher } from './utils/matcher'

export interface Route {
  path: string
  name?: string
  meta?: Record<string, any>
  component: Component | (() => Promise<Component>)
  children?: Route[]
}
interface RouterOptions {
  history: ReturnType<typeof createWebHistory> | ReturnType<typeof createWebHashHistory>
  routes: Route[]
}

export function createRouter(options: RouterOptions) {
  const { routes } = options
  createRouterMatcher(routes)

  const router: Plugin = {
    install(app: App) {
      app.component('RouterLink', {
        setup(props: any, { slots }: any) {
          return () => h('a', { href: props.to, style: { cursor: 'pointer' } }, slots.default?.())
        },
      })

      app.component('RouterView', {
        setup() {
          return () => h('div')
        },
      })
    },
  }

  return router
}

export { createWebHashHistory } from './hash'
export { createWebHistory } from './history'
