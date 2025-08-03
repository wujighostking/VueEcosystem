import type { Link, Subscribe } from './system'
import { endTrack, startTrack } from './system'

// eslint-disable-next-line import/no-mutable-exports
export let activeSub: Subscribe | undefined

export function setActiveSub(currentSub: Subscribe | undefined) {
  activeSub = currentSub
}

interface EffectOptions {
  scheduler: (...args: any[]) => any
}

export function effect(fn: () => any, options?: EffectOptions) {
  const e = new ReactiveEffect(fn)
  Object.assign(e, options)
  e.run()

  const runner: { effect: ReactiveEffect } = e.run.bind(e) as any
  runner.effect = e

  return runner
}

export class ReactiveEffect implements Subscribe {
  public deps: Link | undefined
  public depsTail: Link | undefined
  public tracking = false

  public active = true

  constructor(public fn: () => any) {
  }

  run() {
    if (!this.active) {
      return this.fn()
    }

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

  stop() {
    if (this.active) {
      startTrack(this)
      endTrack(this)

      this.active = false
    }
  }
}
