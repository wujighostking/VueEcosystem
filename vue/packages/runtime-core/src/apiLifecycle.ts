import { getCurrentInstance, setCurrentInstance, unsetCurrentInstance } from './component'

export enum LifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',

  BEFORE_UPDATE = 'bu',
  UPDATE = 'u',

  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'UM',
}

function createHook(type) {
  return (hook, target = getCurrentInstance()) => {
    injectHook(target, hook, type)
  }
}
function injectHook(target, hook, type) {
  if (target[type] == null) {
    target[type] = []
  }
  const _hook = () => {
    setCurrentInstance(target)
    hook()
    unsetCurrentInstance()
  }

  target[type].push(_hook)
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)

export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdate = createHook(LifecycleHooks.UPDATE)

export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED)

export function triggerHooks(instance, type) {
  const hooks = instance[type]

  if (hooks) {
    hooks.forEach(hook => hook())
  }
}
