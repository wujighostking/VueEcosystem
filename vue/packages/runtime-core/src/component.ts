import { proxyRefs } from '@vue/reactivity'
import { hasOwn, isFunction, isObject } from '@vue/shared'
import { initProps, normalizePropsOptions } from './componentProps'
import { initSlots } from './componentSlots'
import { nextTick } from './scheduler'

export function createComponentInstance(vnode, parent) {
  const { type } = vnode
  const appContext = parent ? parent.appContext : vnode.appContext

  const instance = {
    type,
    vnode,
    parent,
    appContext,
    proxy: {},
    render: null,
    setupState: {},
    propsOptions: normalizePropsOptions(type.props),
    props: {},
    attrs: {},
    slots: {},
    refs: {},
    subTree: null,
    isMounted: false,
    ctx: null,
    update: null,
    emit: null,
    provides: parent?.provides || appContext.provides,
  }

  instance.ctx = { _: instance }

  instance.emit = (event, ...args) => emit(instance, event, ...args)

  return instance
}

const publicPropertiesMap = {
  $el: instance => instance.vnode.el,
  $attrs: instance => instance.attrs,
  $emit: instance => instance.emit,
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

    // 设置当前组件实例
    setCurrentInstance(instance)

    // 执行 setup 函数
    const setupResult = type.setup(instance.props, setupContext)

    /**
     * 清楚当前组件的实例
     */
    unsetCurrentInstance()

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
  // 初始化属性
  initProps(instance)

  // 初始化插槽
  initSlots(instance)

  // 初始化状态
  setupStatefulComponent(instance)
}

function createSetupContext(instance) {
  return {
    // 除了 props 外的属性
    get attrs() {
      return instance.attrs
    },
    // 处理事件
    emit(event, ...args) {
      emit(instance, event, ...args)
    },
    //   插槽
    slots: instance.slots,
    expose(exposed) {
      instance.exposed = exposed
    },
  }
}

function emit(instance, event, ...args) {
  const eventName = `on${event[0].toUpperCase() + event.slice(1)}`

  const handler = instance.vnode.props[eventName]

  if (isFunction(handler)) {
    handler(...args)
  }
}

let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}
export function setCurrentInstance(instance) {
  currentInstance = instance
}
export function unsetCurrentInstance() {
  setCurrentInstance(null)
}

/**
 * 当前正在渲染的组件实例
 */
let currentRenderingInstance = null
export function getCurrentRenderingInstance() {
  return currentRenderingInstance
}
export function setCurrentRenderingInstance(instance) {
  currentRenderingInstance = instance
}
export function unsetCurrentRenderingInstance() {
  setCurrentRenderingInstance(null)
}

/**
 * 获取到实例公开的属性
 * @param instance
 */
export function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    if (instance.exposedProxy) {
      return instance.exposedProxy
    }

    instance.exposedProxy = new Proxy(instance.exposed, {
      get(target, key) {
        if (key in target) {
          return target[key]
        }

        if (key in publicPropertiesMap) {
          // $el $props $attrs
          return publicPropertiesMap[key](instance)
        }
      },
    })

    return instance.exposedProxy
  }
  else {
    return instance.proxy
  }
}
