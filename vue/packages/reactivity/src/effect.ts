import type { Link, Subscribe } from './ref'

// eslint-disable-next-line import/no-mutable-exports
export let activeSub: ReactiveEffect | undefined

export function setActiveSub(currentSub: ReactiveEffect | undefined) {
  activeSub = currentSub
}

export function effect(fn: () => any) {
  const e = new ReactiveEffect(fn)
  e.run()
}

class ReactiveEffect implements Subscribe {
  public deps: Link | undefined
  public depsTail: Link | undefined

  constructor(public fn: () => any) {
  }

  run() {
    const prevSub = activeSub

    try {
      setActiveSub(this)

      this.depsTail = undefined

      return this.fn()
    }
    finally {
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
