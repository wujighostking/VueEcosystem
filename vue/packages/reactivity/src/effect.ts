// eslint-disable-next-line import/no-mutable-exports
export let activeSub: (() => any) | undefined

export function setActiveSub(currentSub: (() => any) | undefined) {
  activeSub = currentSub
}

export function effect(fn: () => any) {
  const e = new ReactiveEffect(fn)
  e.run()
}

class ReactiveEffect {
  constructor(public fn: () => any) {
  }

  run() {
    const prevSub = activeSub

    try {
      setActiveSub(this.fn)

      return this.fn()
    }
    finally {
      setActiveSub(prevSub)
    }
  }
}
