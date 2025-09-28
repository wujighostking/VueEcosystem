import type { StartLocationNormalizedOption } from '../utils/config'
import type { createRouterMatcher } from '../utils/matcher'

export type GuardCallback = (to: string, from: string, next: () => void) => void
export type Resolve = ReturnType<ReturnType<typeof createRouterMatcher>['resolve']>
export type Matched = Pick<Resolve, 'matched'>['matched'][0]
export type ExtractComponentsGuards = ReturnType<typeof extractComponentsGuards>

export function useCallback() {
  const handlers: GuardCallback[] = []

  function add(handler: GuardCallback) {
    handlers.push(handler)
  }

  return {
    add,
    list: () => handlers,
  }
}

export function extractComponentsGuards(matched: Matched[], guradType: string, to: Resolve, from: StartLocationNormalizedOption) {
  const guards = []

  for (const record of matched) {
    const rawComponent = record.components.default as any
    const guard = rawComponent[guradType]

    if (guard) {
      guards.push(guardToPromise(guard, to, from, record))
    }
  }

  return guards
}

export function guardToPromise(
  guard: (to: Resolve, from: StartLocationNormalizedOption, next: () => any) => any,
  to: Resolve,
  from: StartLocationNormalizedOption,
  record: Matched,
) {
  return () => new Promise<undefined>((resolve) => {
    const next = () => resolve(undefined)

    const guardReturn = guard.call(record, to, from, next)

    return Promise.resolve(guardReturn).then(next)
  })
}
