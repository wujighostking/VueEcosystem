import type { ComputedRef, EffectScope } from 'vue'
import type { PiniaType } from './createPinia'
import { isFunction, isString } from '@vue/shared'
import { computed, effectScope, getCurrentInstance, inject, reactive } from 'vue'

import { piniaSymbol } from './rootStore'

function createOptionStore(id: string, options: any, pinia: PiniaType) {
  const { state, getters = {}, actions = {} } = options
  function handleGettersToComputed() {
    return Object.keys(getters).reduce<Record<string, ComputedRef>>((getter, getterName) => {
      getter[getterName] = computed(() => {
        const store = pinia._s.get(id)

        return getters[getterName].call(store)
      })

      return getter
    }, {})
  }

  function setup() {
    const localStore = pinia.state!.value[id] = state?.() ?? {}

    const getters = handleGettersToComputed()

    return Object.assign(localStore, actions, getters)
  }

  createSetupStore(id, setup, pinia)
}

function createSetupStore(id: string, setup: () => Record<string, any>, pinia: PiniaType) {
  const { actions = {} } = setup as any
  const store = reactive({})
  let scope: EffectScope

  function wrapAction(action: (...args: any[]) => any) {
    return function (...args: any[]) {
      const result = action.call(store, ...args)

      return result
    }
  }

  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })

  for (const key in actions) {
    const fn = actions[key]

    if (isFunction(fn) && setupStore) {
      setupStore[key] = wrapAction(fn)
    }
  }

  Object.assign(store, setupStore)
  pinia._s.set(id, store)
}

export function defineStore(idOptions: string | ({ id: string }), setup: object | (() => Record<string, any>)) {
  let id: string
  let options: any
  const isSetupStore = isFunction(setup)

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
      if (isSetupStore) {
        createSetupStore(id, setup as (() => Record<string, any>), pinia)
      }
      else {
        createOptionStore(id, options, pinia)
      }
    }

    const store = pinia._s.get(id)
    return store
  }

  return useStore
}
