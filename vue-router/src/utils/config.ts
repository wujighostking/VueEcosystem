export interface StartLocationNormalizedOption {
  path: string
  matched: Array<Record<string, any>>
}

/**
 * @description 初始化路由系统中的默认参数
 */
export const START_LOCATION_NORMALIZED: StartLocationNormalizedOption = {
  path: '/',
  // query: {},
  // params: {},
  matched: [],
}

export const ROUTER = 'router'
export const ROUTER_LOCATION = 'route location'
export const DEPTH = 'depth'
