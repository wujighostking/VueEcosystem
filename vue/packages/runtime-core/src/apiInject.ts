import { getCurrentInstance } from './component'

export function provide(key, value) {
  const instance = getCurrentInstance()

  const parentProvides = instance.parent ? instance.parent.provides : instance.appContext
  let provides = instance.provides

  if (provides === parentProvides) {
    provides = instance.provides = Object.create(parentProvides)
  }

  provides[key] = value
}
export function inject(key, defaultValue) {
  const instance = getCurrentInstance()
  const parentProvides = instance.parent ? instance.parent.provides : instance.appContext
  if (key in parentProvides) {
    return parentProvides[key]
  }

  return defaultValue
}
