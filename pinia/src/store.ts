import type { ComputedRef, EffectScope } from 'vue'
import type { PiniaType } from './createPinia'
import { isFunction, isString } from '@vue/shared'
import { computed, effectScope, getCurrentInstance, inject, reactive } from 'vue'

import { piniaSymbol } from './rootStore'

function createOptionStore(id: string, options: any, pinia: PiniaType) {
  const { state, getters, actions } = options
  const store = reactive({})
  let scope: EffectScope

  function wrapAction(action: (...args: any[]) => any) {
    return function (...args: any[]) {
      const result = action.call(store, ...args)

      return result
    }
  }

  function setup() {
    const localStore = pinia.state!.value[id] = state?.() ?? {}

    return Object.assign(localStore, actions, Object.keys(getters).reduce<Record<string, ComputedRef>>((getter, getterName) => {
      getter[getterName] = computed(() => getters[getterName].call(store))

      return getter
    }, {}))
  }

  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })

  for (const key in actions) {
    const fn = actions[key]

    if (isFunction(fn)) {
      setupStore[key] = wrapAction(fn)
    }
  }

  Object.assign(store, setupStore)
  pinia._s.set(id, store)
}

export function defineStore(idOptions: string | ({ id: string }), setup: object | (() => object)) {
  let id: string
  let options: any

  if (isString(idOptions)) {
    id = idOptions
    options = setup
  }
  else {
    id = idOptions.id
    options = idOptions
  }

  function useStore() {
    const instance = getCurrentInstance()
    const pinia = (instance && inject(piniaSymbol)) as PiniaType

    if (!pinia._s.has(id)) {
    //   创建store
      createOptionStore(id, options, pinia)
    }

    const store = pinia._s.get(id)
    return store
  }

  return useStore
}
