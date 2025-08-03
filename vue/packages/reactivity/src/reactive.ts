import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

const reactiveMap = new WeakMap()
const reactiveSet = new WeakSet()

export function reactive<T extends Record<any, any>>(target: T) {
  return createReactiveImpl<T>(target)
}

export function createReactiveImpl<T = Record<any, any>>(target: T & object) {
  if (!isObject(target)) {
    return target
  }

  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  if (reactiveSet.has(target)) {
    return target
  }

  const proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy)
  reactiveSet.add(proxy)

  return proxy
}

export function isReactive(value: any) {
  return reactiveSet.has(value)
}
