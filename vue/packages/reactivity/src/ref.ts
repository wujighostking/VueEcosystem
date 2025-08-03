import type { Dependency, Link } from './system'
import { hasChanged, isObject } from '@vue/shared'
import { reactive } from './reactive'
import { tracked, trigger } from './system'

export function ref<T = any>(value: T) {
  return new RefImpl<T>(value)
}

export enum ReactiveFlags {
  IS_Ref = '__v_isRef',
}

export class RefImpl<T = any> implements Dependency {
  [ReactiveFlags.IS_Ref] = true
  private _value: T
  public subs: Link | undefined
  public subsTail: Link | undefined

  constructor(value: T) {
    this._value = isObject(value) ? reactive(value as Record<any, any>) : value
  }

  get value() {
    tracked(this)

    return this._value
  }

  set value(newValue: T) {
    if (hasChanged(this._value, newValue)) {
      this._value = isObject(newValue) ? reactive(newValue as Record<any, any>) : newValue

      trigger(this)
    }
  }
}
export function isRef(value: any) {
  return !!(value && value[ReactiveFlags.IS_Ref])
}
