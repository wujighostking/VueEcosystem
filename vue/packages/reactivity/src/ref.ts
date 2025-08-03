import type { Dependency, Link } from './system'
import { hasChanged, isObject } from '@vue/shared'
import { isReactive, reactive } from './reactive'
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

export class ObjectRefImpl {
  constructor(private _object: Record<any, any>, private _key: keyof typeof _object) {
  }

  get value() {
    return this._object[this._key]
  }

  set value(newValue) {
    this._object[this._key] = newValue
  }
}

export function toRef(target: Record<any, any>, key: keyof typeof target) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(target: Record<any, any>) {
  if (!isReactive(target)) {
    console.error('必须是响应式对象')
    return
  }

  const res: keyof typeof target = {}
  for (const key in target) {
    res[key] = toRef(target[key], key)
  }

  return res
}

export function proxyRefs(target: Record<any, RefImpl>) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)

      return unref(res)
    },

    set(target, key: any, newValue, receiver) {
      const oldValue = target[key]

      if (isRef(oldValue) && !isRef(newValue)) {
        oldValue.value = newValue

        return true
      }

      return Reflect.set(target, key, newValue, receiver)
    },
  })
}

export function unref(value: any) {
  return isRef(value) ? value.value : value
}

export function isRef(value: any) {
  return !!(value && value[ReactiveFlags.IS_Ref])
}
