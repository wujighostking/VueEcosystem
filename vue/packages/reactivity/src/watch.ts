import type { RefImpl } from './ref'
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
  const { immediate, once } = options || {}

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
