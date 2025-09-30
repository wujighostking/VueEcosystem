import type { App, Component, ComputedRef, Plugin } from 'vue'
import type { Resolve } from './guards'
import type { createWebHashHistory } from './hash'
import type { createWebHistory } from './history'

import type { StartLocationNormalizedOption } from './utils/config'
import { computed, reactive, shallowRef, unref } from 'vue'
import { RouterLink } from './components/router-link'
import { RouterView } from './components/RouterView'
import { extractChangeRecords, extractComponentsGuards, guardToPromise, runGuardQueue, useCallback } from './guards'
import { ROUTER, ROUTER_LOCATION, START_LOCATION_NORMALIZED } from './utils/config'
import { createRouterMatcher } from './utils/matcher'

export interface Route {
  path: string
  name?: string
  meta?: Record<string, any>
  component: Component | (() => Promise<Component>)
  children?: Route[]
  beforeEnter?: (...args: any[]) => void
}
interface RouterOptions {
  history: ReturnType<typeof createWebHistory> | ReturnType<typeof createWebHashHistory>
  routes: Route[]
}
export type RouterResult = {
  push: (to: string) => void
  replace: (to: string) => void
  beforeEach: (handler: (to: string, from: string, next: () => void) => void) => void
  beforeResolve: (handler: (to: string, from: string, next: () => void) => void) => void
  afterEach: (handler: (to: string, from: string, next: () => void) => void) => void
} & Plugin

export type RouteLocation = Record<keyof StartLocationNormalizedOption, ComputedRef>

export function createRouter(options: RouterOptions) {
  const { history: routerHistory, routes } = options

  const matcher = createRouterMatcher(routes)

  const currentRoute = shallowRef<StartLocationNormalizedOption>(START_LOCATION_NORMALIZED)

  const beforeGuards = useCallback()
  const beforeResolveGuards = useCallback()
  const afterGuards = useCallback()

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

  async function naviagte(to: Resolve, from: StartLocationNormalizedOption) {
    // 确定进入的组件、离开的组件，更新的组件

    const [leavingRecords, updatingRecords, enteringRecords] = extractChangeRecords(to, from)

    let guards = extractComponentsGuards(
      leavingRecords.reverse(),
      'beforeRouteLeave',
      to,
      from,
    )

    return runGuardQueue(guards).then(() => {
      guards.length = 0

      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromise(guard as any, to, from, guard as any))
      }

      return runGuardQueue(guards)
    }).then(() => {
      guards = extractComponentsGuards(
        updatingRecords,
        'beforeRouteUpdate',
        to,
        from,
      )

      return runGuardQueue(guards)
    }).then(() => {
      guards.length = 0

      for (const record of to.matched) {
        if (record.beforeEnter) {
          guards.push(guardToPromise(record.beforeEnter, to, from, record))
        }
      }

      return runGuardQueue(guards)
    }).then(() => {
      guards = extractComponentsGuards(
        enteringRecords,
        'beforeRouteEnter',
        to,
        from,
      )

      return runGuardQueue(guards)
    }).then(() => {
      guards.length = 0

      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromise(guard as any, to, from, guard as any))
      }

      return runGuardQueue(guards)
    })
  }

  function pushWithRedirect(to: string) {
    const targetLocation = resolve(to)
    const from = currentRoute.value

    naviagte(targetLocation!, from).then(() => {
      // 根据是不是第一次，来决定是 push 还是 replace
      return finalizeNavigation(targetLocation, from)
    }).then(() => {
      for (const guard of afterGuards.list()) {
        guard(to, from as unknown as string, () => {})
      }
    })
  }

  function push(to: string) {
    return pushWithRedirect(to)
  }

  function replace(to: string) {
    const targetLocation = resolve(to)
    const from = currentRoute.value

    naviagte(targetLocation!, from).then(() => {
      // 根据是不是第一次，来决定是 push 还是 replace
      return finalizeNavigation(targetLocation, from, true)
    }).then(() => {
      for (const guard of afterGuards.list()) {
        guard(to, from as unknown as string, () => {})
      }
    })
  }

  const router: RouterResult = {
    push,
    replace,
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    install(app: App) {
      app.config.globalProperties.$router = router
      Object.defineProperty(app.config.globalProperties, '$route', { enumerable: true, get: () => unref(currentRoute) })

      const reactiveRoute: Partial<RouteLocation> = {}
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
export { useRoute, useRouter } from './hooks'
