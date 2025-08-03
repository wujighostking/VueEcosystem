import type { RefImpl } from './ref'
import { isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isRef } from './ref'

type WatchCallback = (newValue: any, oldValue: any) => void
type WatchSource = RefImpl
type WatchStopHandle = () => void
interface WatchOptions {
  immediate?: boolean
  once?: boolean
  deep?: boolean | number
}

export function watch(source: WatchSource, watchCallback: WatchCallback, options?: WatchOptions): WatchStopHandle {
  const { immediate, once, deep } = options || {}

  if (once) {
    const _watchCallback = watchCallback
    watchCallback = (...args) => {
      _watchCallback(...args)
      stop()
    }
  }

  let getter!: () => any

  if (isRef(source)) {
    getter = () => source.value
  }

  if (deep) {
    const baseGetter = getter
    const depth = deep === true ? Infinity : deep
    getter = () => traverse(baseGetter(), depth, new Set())
  }

  let oldValue: undefined

  const effect = new ReactiveEffect(getter)

  if (immediate) {
    job()
  }
  else {
    oldValue = effect.run()
  }

  effect.scheduler = job

  function job() {
    const newValue = effect.run()
    watchCallback(newValue, oldValue)

    oldValue = newValue
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
