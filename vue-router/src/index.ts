import type { App, Component, ComputedRef, Plugin } from 'vue'

import type { createWebHashHistory } from './hash'
import type { createWebHistory } from './history'

import type { StartLocationNormalizedOption } from './utils/config'
import { computed, h, reactive, shallowRef, unref } from 'vue'
import { START_LOCATION_NORMALIZED } from './utils/config'
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
  // eslint-disable-next-line unused-imports/no-unused-vars
  const matcher = createRouterMatcher(routes)

  const currentRoute = shallowRef<StartLocationNormalizedOption>(START_LOCATION_NORMALIZED)

  const router: Plugin = {
    install(app: App) {
      app.config.globalProperties.$router = router
      Object.defineProperty(app.config.globalProperties, '$route', { enumerable: true, get: () => unref(currentRoute) })

      const reactiveRoute: Partial<Record<keyof StartLocationNormalizedOption, ComputedRef>> = {}
      for (const k in START_LOCATION_NORMALIZED) {
        const key = k as keyof StartLocationNormalizedOption
        reactiveRoute[key] = computed(() => currentRoute.value[key])
      }

      app.provide('router', router)
      app.provide('route location', reactive(reactiveRoute))
      // useRouter()  inject('router')
      // useRoute()  inject('route location')

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
