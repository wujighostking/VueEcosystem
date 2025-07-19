import type { EffectScope } from 'vue'
import type { PiniaType } from './createPinia'
import { isString } from '@vue/shared'
import { effectScope, getCurrentInstance, inject, reactive } from 'vue'

import { piniaSymbol } from './rootStore'

function createOptionStore(id: string, options: any, pinia: PiniaType) {
  const { state } = options
  const store = reactive({})
  let scope: EffectScope

  function setup() {
    const localStore = pinia.state!.value[id] = state?.() ?? {}

    return localStore
  }

  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })

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
