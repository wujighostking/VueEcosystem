import type { ComputedRef, EffectScope, Ref } from 'vue'
import type { PiniaType } from './createPinia'
import { isFunction, isObject, isString } from '@vue/shared'
import { computed, effectScope, getCurrentInstance, inject, isRef, reactive, toRefs, watch } from 'vue'
import { piniaSymbol } from './rootStore'

interface storeExternal {
  $patch: (state: Record<string, any>) => void
  $reset: () => void
}

function isComputed(o: any): o is ComputedRef {
  return !!(isRef(o) && (o as any).effect)
}

function merge(target: Record<string, any>, partialState: Record<string, any>) {
  for (const key in partialState) {
    const newState = partialState[key]
    const oldState = target[key]

    if (isObject(newState) && isObject(oldState) && !isRef(newState)) {
      target[key] = merge(oldState, newState)
    }
    else {
      target[key] = newState
    }
  }

  return target
}

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
    pinia.state!.value[id] = state?.() ?? {}
    const localStore = toRefs(pinia.state!.value[id])

    const getters = handleGettersToComputed()

    return Object.assign(localStore, actions, getters)
  }

  const store = createSetupStore(id, setup, pinia, false) as unknown as storeExternal

  store.$reset = function () {
    store.$patch(state?.() ?? {})
  }
}

function createSetupStore(id: string, setup: () => Record<string, any>, pinia: PiniaType, isSetupStore: boolean) {
  let scope: EffectScope

  const store = reactive({
    $patch(partialStateOrMutator: Record<string, any> | ((state: Ref) => void)) {
      if (isFunction(partialStateOrMutator)) {
        partialStateOrMutator(pinia._s.get(id))
      }
      else {
        merge(pinia.state!.value[id], partialStateOrMutator)
      }
    },

    $subscribe(fn: (state: any, id: string) => void) {
      const state = pinia.state?.value[id]

      scope.run(() => watch(state, (newState) => {
        fn(newState, id)
      }))
    },

    $dispose() {
      scope.stop()
      pinia._s.delete(id)
    },
  })

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

  if (!pinia.state?.value[id]) {
    pinia.state!.value[id] = {}
  }

  for (const key in setupStore) {
    const fn = setupStore[key]

    if (isFunction(fn)) {
      setupStore[key] = wrapAction(fn)
    }
    else if (isSetupStore && !isComputed(fn)) {
      pinia.state!.value[id][key] = fn
    }
  }

  Object.assign(store, setupStore)

  Object.defineProperty(store, '$state', {
    get() { return pinia.state!.value[id] },
    set(newState) { store.$patch(newState) },
  })

  pinia._p.forEach(plugin => scope.run(() => plugin({ store, id })))
  pinia._s.set(id, store)

  return store
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
        createSetupStore(id, setup as (() => Record<string, any>), pinia, true)
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
