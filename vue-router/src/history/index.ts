type PathType = string | URL | null
type HistoryStateNavigation = ReturnType<typeof buildState>

export function createWebHistory(base = '') {
  const historyNavigation = useHistoryStateNavigation(base)

  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location)

  const routerHistory = Object.assign({}, historyNavigation, historyListeners)

  Object.defineProperties(routerHistory, {
    location: {
      get: () => historyNavigation.location.value,
    },
    state: {
      get: () => historyNavigation.state.value,
    },
  })

  return routerHistory
}

function useHistoryListeners(base: string, historyState: ReturnType<typeof useHistoryStateNavigation>['state'], currentLocation: ReturnType<typeof useHistoryStateNavigation>['location']) {
  const listeners: ((to: PathType, from: PathType, options: { isBack: boolean }) => void)[] = []
  const popStatehandler = ({ state }: PopStateEvent) => {
    const to = createCurrentLocation(base)
    const from = currentLocation.value
    const fromState = historyState.value

    currentLocation.value = to
    historyState.value = state

    // 小于 0 表示回退
    const isBack = state.position - fromState.position < 0

    listeners.forEach((listener) => {
      listener(to, from, { isBack })
    })
  }

  window.addEventListener('popstate', popStatehandler)

  function listen(callback: (to: PathType, from: PathType, options: { isBack: boolean }) => void) {
    listeners.push(callback)
  }

  return {
    listen,
  }
}

/**
 * @description 包含当前路径，当前路径下的状态，提供切换路径的方法: pushState, replaceState
 */
function useHistoryStateNavigation(base: string) {
  const currentLocation = {
    value: createCurrentLocation(base),
  }

  const historyState = {
    value: window.history.state,
  }

  // 第一次刷新页面，没有任何状态，需要创建一个状态（后退路径，当前路径，前进路径，跳转模式，跳转后滚动条位置）
  if (historyState.value == null) {
    changeLocation(currentLocation.value, buildState(null, currentLocation.value, null, true), true)
  }

  function changeLocation(to: PathType, state: any, replace: boolean) {
    const hasPos = base.includes('#')
    const url = hasPos ? base + to : to
    window.history[replace ? 'replaceState' : 'pushState'](state, '', url)
    historyState.value = state
  }

  function push(to: PathType, data: Record<any, any>) {
    const curretnState: HistoryStateNavigation = Object.assign(
      {},
      historyState.value,
      { forward: to, scroll: { left: window.pageXOffset, top: window.pageYOffset } },
    )
    changeLocation(curretnState.current, curretnState, true)

    const state = Object.assign(
      {},
      buildState(currentLocation.value, to, null),
      { position: curretnState.position + 1 },
      data,
    )
    changeLocation(to, state, false)
    currentLocation.value = to
  }

  function replace(to: PathType, data: Record<any, any>) {
    const state = Object.assign({}, buildState(historyState.value.back, to, historyState.value.forward, true), data)

    changeLocation(to, state, true)

    // 替换后需要将路径变为现在的路径
    currentLocation.value = to
  }

  return {
    location: currentLocation,
    state: historyState,
    push,
    replace,
  }
}

function createCurrentLocation(base: string): PathType {
  const { pathname, search, hash } = window.location

  const hasPos = base.includes('#')
  if (hasPos) {
    return base.slice(1) || '/'
  }

  return pathname + search + hash
}

function buildState(back: PathType, current: PathType, forward: PathType, replace: boolean = false, computedScroll: boolean = false) {
  return {
    back,
    current,
    forward,
    replace,
    scroll: computedScroll ? { left: window.pageXOffset, top: window.pageYOffset } : null,
    position: window.history.length - 1,
  }
}
