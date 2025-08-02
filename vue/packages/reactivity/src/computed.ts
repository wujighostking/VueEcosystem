import type { Dependency, Link, Subscribe } from './system'
import { isFunction } from '@vue/shared'
import { activeSub, setActiveSub } from './effect'
import { ReactiveFlags } from './ref'
import { endTrack, link, startTrack } from './system'

type Getter = () => any
type Setter = ((value: any) => void) | undefined
export function computed<T = any>(getterOrOptions: { get: Getter, set: Setter }) {
  let getter: Getter
  let setter: Setter

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions as any as Getter
  }
  else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl<T>(getter, setter)
}

export class ComputedRefImpl<T = any> implements Dependency, Subscribe {
  [ReactiveFlags.IS_Ref] = true

  private _value: T | undefined

  deps: Link | undefined
  depsTail: Link | undefined

  subs: Link | undefined
  subsTail: Link | undefined

  tracking = false

  constructor(public getter: Getter, private setter: Setter) {
  }

  get value() {
    this.update()

    if (activeSub) {
      link(this, activeSub)
    }

    return this._value
  }

  set value(newValue: any) {
    if (this.setter) {
      this.setter(newValue)
    }
    else {
      console.warn('computed value is readonly')
    }
  }

  update() {
    const prevSub = activeSub

    setActiveSub(this)
    startTrack(this)

    try {
      this._value = this.getter()
    }
    finally {
      endTrack(this)

      setActiveSub(prevSub)
    }
  }
}
