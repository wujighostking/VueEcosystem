import type { RefImpl } from './ref'
import { ReactiveEffect } from './effect'
import { isRef } from './ref'

type WatchCallback = (newValue: any, oldValue: any) => void
type WatchSource = RefImpl
type WatchStopHandle = () => void

export function watch(source: WatchSource, watchCallback: WatchCallback): WatchStopHandle {
  let getter!: () => any

  if (isRef(source)) {
    getter = () => source.value
  }

  const effect = new ReactiveEffect(getter)

  let oldValue = effect.run()

  effect.scheduler = () => {
    const newValue = effect.run()
    watchCallback(newValue, oldValue)

    oldValue = newValue
  }

  return () => {}
}
