import type { ReactiveEffect } from 'vue'
import { activeSub } from './effect'

export function ref<T = any>(value: T) {
  return new RefImpl<T>(value)
}

export interface Link {
  sub: ReactiveEffect | undefined
  prevSub: Link | undefined
  nextSub: Link | undefined
}

class RefImpl<T = any> {
  private _value: T
  public subs: Link | undefined
  public subTail: Link | undefined

  constructor(value: T) {
    this._value = value
  }

  get value() {
    // tracked(this)

    if (activeSub) {
      const link: Link = {
        sub: activeSub,
        prevSub: undefined,
        nextSub: undefined,
      }

      if (!this.subTail) {
        this.subs = link
        this.subTail = link
      }
      else {
        this.subTail.nextSub = link
        link.prevSub = this.subTail
        this.subTail = link
      }
    }

    return this._value
  }

  set value(newValue: T) {
    this._value = newValue

    let link = this.subs

    const queuedEffect = []

    while (link) {
      queuedEffect.push(link.sub)

      link = link.nextSub
    }

    queuedEffect.forEach((effect) => {
      effect()
    })
  }
}

// function tracked(dep) {
//
// }
