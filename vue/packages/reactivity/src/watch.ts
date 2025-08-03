import type { RefImpl } from './ref'
import { isFunction, isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isRef } from './ref'

type WatchCallback = (newValue: any, oldValue: any, onCleanup: (cleanup: () => void) => void) => void
type WatchSource = RefImpl | (() => any)
type WatchStopHandle = () => void
interface WatchOptions {
  immediate?: boolean
  once?: boolean
  deep?: boolean | number
}

export function watch(source: WatchSource, watchCallback: WatchCallback, options?: WatchOptions): WatchStopHandle {
  let { immediate, once, deep } = options || {}

  if (once) {
    const _watchCallback = watchCallback
    watchCallback = (...args) => {
      _watchCallback(...args)
      stop()
    }
  }

  let getter!: () => any

  if (isRef(source)) {
    getter = () => (source as RefImpl).value
  }
  else if (isReactive(source)) {
    getter = () => source
    if (!deep) {
      deep = true
    }
  }
  else if (isFunction(source)) {
    getter = source as (() => any)
  }

  if (deep) {
    const baseGetter = getter
    const depth = deep === true ? Infinity : deep
    getter = () => traverse(baseGetter(), depth, new Set())
  }

  let oldValue: undefined
  let cleanup: null | (() => void)

  const effect = new ReactiveEffect(getter)

  if (immediate) {
    job()
  }
  else {
    oldValue = effect.run()
  }

  effect.scheduler = job

  function job() {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    const newValue = effect.run()
    watchCallback(newValue, oldValue, onCleanup)

    oldValue = newValue
  }

  function onCleanup(cleanupCallback: () => void) {
    cleanup = cleanupCallback
  }

  function stop() {
    effect.stop()
  }

  return stop
}

function traverse(value: any, depth: number, seen: Set<any>) {
  if (!isObject(value) || depth <= 0 || seen.has(value)) {
    return value
  }

  seen.add(value)
  depth--

  for (const key in value) {
    traverse(value[key], depth, seen)
  }

  return value
}
