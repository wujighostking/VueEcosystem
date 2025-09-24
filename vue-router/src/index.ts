type PathType = string | URL | null
type State = ReturnType<typeof buildState>

export function createWebHistory() {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const historyNavigation = useHistoryStateNavigation()
}

/**
 * @description 包含当前路径，当前路径下的状态，提供切换路径的方法: pushState, replaceState
 */
function useHistoryStateNavigation() {
  const currentLocation = {
    value: createCurrentLocation(),
  }

  const historyState = {
    value: window.history.state,
  }

  // 第一次刷新页面，没有任何状态，需要创建一个状态（后退路径，当前路径，前进路径，跳转模式，跳转后滚动条位置）
  if (historyState.value == null) {
    changeLocation(currentLocation.value, buildState(null, currentLocation.value, null, true), true)
  }

  function changeLocation(to: PathType, state: any, repalce: boolean) {
    window.history[repalce ? 'replaceState' : 'pushState'](state, '', to)
    historyState.value = state
  }

  function push(to: PathType, data: Record<any, any>) {
    const curretnState: State = Object.assign(
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

  function repalce(to: PathType, data: Record<any, any>) {
    const state = Object.assign({}, buildState(historyState.value.back, to, historyState.value.forward), data)

    changeLocation(to, state, true)

    // 替换后需要将路径变为现在的路径
    currentLocation.value = to
  }

  return {
    location: currentLocation,
    state: historyState,
    push,
    repalce,
  }
}

function createCurrentLocation(): PathType {
  const { pathname, search, hash } = window.location

  return pathname + search + hash
}

function buildState(back: PathType, current: PathType, forward: PathType, repalce: boolean = false, computedScroll: boolean = false) {
  return {
    back,
    current,
    forward,
    replace: repalce,
    scroll: computedScroll ? { left: window.pageXOffset, top: window.pageYOffset } : null,
    position: window.history.length - 1,
  }
}
