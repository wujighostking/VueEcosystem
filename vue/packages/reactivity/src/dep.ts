import type { Dependency, Link } from './system'
import { activeSub } from './effect'
import { link, propagate } from './system'

const targetMap = new WeakMap()

export function track(target: Record<any, any>, key: keyof typeof target) {
  if (!activeSub) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Dep()))
  }

  link(dep, activeSub)
}

export function trigger(target: Record<any, any>, key: keyof typeof target) {
  const depsMap = targetMap.get(target)

  if (!depsMap) {
    return
  }

  const dep: Dep = depsMap.get(key)
  if (!dep) {
    return
  }

  propagate(dep.subs!)
}

export class Dep implements Dependency {
  subs: Link | undefined
  subsTail: Link | undefined
}
