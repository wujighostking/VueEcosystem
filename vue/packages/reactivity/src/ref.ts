import type { Dependency, Link } from './system'
import { tracked, trigger } from './system'

export function ref<T = any>(value: T) {
  return new RefImpl<T>(value)
}

class RefImpl<T = any> implements Dependency {
  private _value: T
  public subs: Link | undefined
  public subsTail: Link | undefined

  constructor(value: T) {
    this._value = value
  }

  get value() {
    tracked(this)

    return this._value
  }

  set value(newValue: T) {
    this._value = newValue

    trigger(this)
  }
}
