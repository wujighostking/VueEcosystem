import { hasChanged, isObject } from '@vue/shared'
import { track, trigger } from './dep'
import { reactive } from './reactive'
import { isRef } from './ref'

export const mutableHandlers: ProxyHandler<Record<any, any>> = {
  get(target, key, receiver) {
    track(target, key)
    const res = Reflect.get(target, key, receiver)

    if (isRef(res)) {
      return res.value
    }

    if (isObject(res)) {
      return reactive(res)
    }

    return res
  },

  set(target, key: keyof typeof target, newValue, receiver) {
    const oldValue = target[key]

    const res = Reflect.set(target, key, newValue, receiver)

    if (isRef(oldValue) && !isRef(newValue)) {
      oldValue.value = newValue

      return res
    }

    if (hasChanged(oldValue, newValue)) {
      trigger(target, key)
    }

    return res
  },
}
