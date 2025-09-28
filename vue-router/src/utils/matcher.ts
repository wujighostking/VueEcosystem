import type { Route } from '..'

export function createRouterMatcher(routes: Route[]) {
  const matchers: RouteRecordMatcher[] = []

  function addRoute(route: Route, parent?: RouteRecordMatcher | undefined) {
    const normalizedRecord = normalizeRouteRecord(route)

    if (parent) {
      normalizedRecord.path = parent.path + normalizedRecord.path
    }

    const matcher = createRouteRecordMatcher(normalizedRecord, parent)

    if ('children' in normalizedRecord) {
      const children = normalizedRecord.children
      for (let i = 0; i < children.length; i++) {
        addRoute(children[i], matcher)
      }
    }

    matchers.push(matcher)
  }

  routes.forEach(route => addRoute(route))

  /**
   * @example { path: '/', matched: HomeRecord }  { path: '/a', matched: [ HomeRecord, aRecord ] }
   */
  function resolve(location: { path: string }) {
    const matched = []

    const path = location.path
    let matcher = matchers.find(m => m.path === path)

    while (matcher) {
      matched.unshift(matcher.record)
      matcher = matcher.parent
    }

    return {
      path,
      matched,
    }
  }

  return { resolve, addRoute }
}

function normalizeRouteRecord(record: Route) {
  return {
    path: record.path,
    name: record.name,
    meta: record.meta,
    components: {
      default: record.component,
    },
    parent: null,
    children: record.children || [],
    beforeEnter: record.beforeEnter,
  }
}

interface RouteRecordMatcher {
  path: string
  record: ReturnType<typeof normalizeRouteRecord>
  parent: RouteRecordMatcher | undefined
  children: RouteRecordMatcher[]
}
function createRouteRecordMatcher(record: ReturnType<typeof normalizeRouteRecord>, parent: RouteRecordMatcher | undefined): RouteRecordMatcher {
  return {
    path: record.path,
    record,
    parent,
    children: [],
  }
}
