import type { Reactive } from 'vue'
import type { RouteLocation, RouterResult } from '..'
import { inject } from 'vue'
import { ROUTER, ROUTER_LOCATION } from '../utils/config'

export function useRouter() {
  const router = inject<RouterResult>(ROUTER)!

  return router
}

export function useRoute() {
  const route = inject<Reactive<RouteLocation>>(ROUTER_LOCATION)

  return route
}
