import { proxyRefs } from '@vue/reactivity'
import { hasOwn, isFunction, isObject } from '@vue/shared'
import { initProps, normalizePropsOptions } from './componentProps'
import { nextTick } from './scheduler'

export function createComponentInstance(vnode) {
  const { type } = vnode

  const instance = {
    type,
    vnode,
    proxy: {},
    render: null,
    setupState: null,
    propsOptions: normalizePropsOptions(type.props),
    props: {},
    attrs: {},
    slots: {},
    refs: {},
    subTree: null,
    isMounted: false,
    ctx: null,
    update: null,
  }

  instance.ctx = { _: instance }

  return instance
}

const publicPropertiesMap = {
  $attrs: instance => instance.attrs,
  $slots: instance => instance.slots,
  $refs: instance => instance.refs,
  $nextTick: (instance) => {
    return nextTick.bind(instance)
  },
  $forceUpdate: (instance) => {
    return () => instance.update()
  },
}

const publicInstanceProxyHandlers = {
  get(target, key) {
    const { _: instance } = target
    const { setupState, props } = instance

    if (hasOwn(setupState, key)) {
      return setupState[key]
    }

    if (hasOwn(props, key)) {
      return props[key]
    }

    if (hasOwn(publicPropertiesMap, key)) {
      return publicPropertiesMap[key]?.(instance)
    }

    return instance[key]
  },

  set(target, key, value) {
    const { _: instance } = target
    const { setupState } = instance

    if (hasOwn(setupState, key)) {
      setupState[key] = value
      return true
    }
  },
}

function setupStatefulComponent(instance) {
  const { type } = instance

  instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers)

  if (isFunction(type.setup)) {
    const setupContext = createSetupContext(instance)
    instance.setupContext = setupContext
    const setupResult = type.setup(instance.props, setupContext)

    handleSetupResult(instance, setupResult)

    instance.setupState = setupResult
  }

  if (!instance.render) {
    instance.render = type.render
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  }
  else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }
}

export function setupComponent(instance) {
  initProps(instance)
  setupStatefulComponent(instance)
}

function createSetupContext(instance) {
  return {
    get attrs() {
      return instance.attrs
    },
  }
}
