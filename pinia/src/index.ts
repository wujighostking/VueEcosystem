import type { Ref } from 'vue'
import { isReactive, isRef, toRaw, toRef } from 'vue'

export * from './createPinia'
export * from './rootStore'
export * from './store'

export function storeToRefs(store: Record<string, Ref>) {
  const result: Record<string, Ref> = {}
  const rawStore = toRaw(store)

  for (const key in rawStore) {
    const v = rawStore[key]
    if (isRef(v) || isReactive(v)) {
      result[key] = toRef(v)
    }
  }

  return result
}
