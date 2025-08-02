import type { Link, Subscribe } from './system'
import { endTrack, startTrack } from './system'

// eslint-disable-next-line import/no-mutable-exports
export let activeSub: ReactiveEffect | undefined

export function setActiveSub(currentSub: ReactiveEffect | undefined) {
  activeSub = currentSub
}

interface EffectOptions {
  scheduler: (...args: any[]) => any
}

export function effect(fn: () => any, options?: EffectOptions) {
  const e = new ReactiveEffect(fn)
  Object.assign(e, options)
  e.run()

  const runner: { effect: ReactiveEffect } = e.run.bind(e)
  runner.effect = e

  return runner
}

export class ReactiveEffect implements Subscribe {
  public deps: Link | undefined
  public depsTail: Link | undefined

  constructor(public fn: () => any) {
  }

  run() {
    const prevSub = activeSub

    try {
      setActiveSub(this)

      startTrack(this)

      return this.fn()
    }
    finally {
      endTrack(this)

      setActiveSub(prevSub)
    }
  }

  scheduler() {
    this.run()
  }

  notify() {
    this.scheduler()
  }
}
