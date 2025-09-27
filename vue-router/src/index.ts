import type { App, Component, ComputedRef, Plugin } from 'vue'
import type { createWebHashHistory } from './hash'
import type { createWebHistory } from './history'
import type { StartLocationNormalizedOption } from './utils/config'

import { computed, reactive, shallowRef, unref } from 'vue'
import { RouterLink } from './components/router-link'
import { RouterView } from './components/RouterView'
import { ROUTER, ROUTER_LOCATION, START_LOCATION_NORMALIZED } from './utils/config'
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
  const { history: routerHistory, routes } = options

  const matcher = createRouterMatcher(routes)

  const currentRoute = shallowRef<StartLocationNormalizedOption>(START_LOCATION_NORMALIZED)

  let ready = false

  function markAsReady() {
    if (ready)
      return

    ready = true
    routerHistory.listen((to) => {
      const targetLocation = resolve(to as string)
      const from = currentRoute.value

      // 前进/后退采用替换模式
      finalizeNavigation(targetLocation, from, true)
    })
  }

  function resolve(to: string | object) {
    if (typeof to === 'string') {
      return matcher.resolve({ path: to })
    }
  }

  function finalizeNavigation(to: any, from: StartLocationNormalizedOption, repalced: boolean = false) {
    if (from === START_LOCATION_NORMALIZED || repalced) {
      routerHistory.replace(to.path, {})
    }
    else {
      routerHistory.push(to.path, {})
    }

    currentRoute.value = to

    markAsReady()
  }

  function pushWithRedirect(to: string) {
    const targetLocation = resolve(to)
    const from = currentRoute.value

    // 根据是不是第一次，来决定是 push 还是 replace
    finalizeNavigation(targetLocation, from)
  }

  function push(to: string) {
    return pushWithRedirect(to)
  }

  const router: Plugin & { push: (to: string) => void } = {
    push,
    install(app: App) {
      app.config.globalProperties.$router = router
      Object.defineProperty(app.config.globalProperties, '$route', { enumerable: true, get: () => unref(currentRoute) })

      const reactiveRoute: Partial<Record<keyof StartLocationNormalizedOption, ComputedRef>> = {}
      for (const k in START_LOCATION_NORMALIZED) {
        const key = k as keyof StartLocationNormalizedOption
        reactiveRoute[key] = computed(() => currentRoute.value[key])
      }

      app.provide(ROUTER, router)
      app.provide(ROUTER_LOCATION, reactive(reactiveRoute))
      // useRouter()  inject('router')
      // useRoute()  inject('route location')

      app.component('RouterLink', RouterLink)
      app.component('RouterView', RouterView)

      if (currentRoute.value === START_LOCATION_NORMALIZED) {
        // 第一次渲染
        push(routerHistory.location as unknown as string)
      }
    },
  }

  return router
}

export { createWebHashHistory } from './hash'
export { createWebHistory } from './history'
