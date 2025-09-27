import type { Component } from 'vue'
import type { StartLocationNormalizedOption } from '../utils/config'
import { computed, h, inject, provide } from 'vue'
import { DEPTH, ROUTER_LOCATION } from '../utils/config'

export const RouterView: Component = {
  name: 'RouterView',

  setup(_, { slots }) {
    const depth = inject(DEPTH, 0)
    const injectRoute = inject(ROUTER_LOCATION) as Record<keyof StartLocationNormalizedOption, any>
    const matchedRouteRef = computed(() => injectRoute.matched[depth])

    provide(DEPTH, depth + 1)

    return () => {
      const matchRoute = matchedRouteRef.value
      const viewComponent = matchRoute?.components?.default

      if (!viewComponent)
        return slots.default?.()

      return h(viewComponent)
    }
  },
}
