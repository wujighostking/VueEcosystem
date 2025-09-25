import type { Component } from 'vue'
import type { StartLocationNormalizedOption } from '../utils/config'
import { computed, h, inject, provide } from 'vue'

export const RouterView: Component = {
  name: 'RouterView',

  setup(props, { slots }) {
    const depth = inject('depth', 0)
    const injectRoute = inject('route location') as Record<keyof StartLocationNormalizedOption, any>
    const matchedRouteRef = computed(() => injectRoute.matched[depth])

    provide('depth', depth + 1)

    return () => {
      const matchRoute = matchedRouteRef.value
      const viewComponent = matchRoute?.components?.default

      if (!viewComponent)
        return slots.default?.()

      return h(viewComponent)
    }
  },
}
