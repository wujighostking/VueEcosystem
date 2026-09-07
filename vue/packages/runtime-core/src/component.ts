import { proxyRefs } from '@vue/reactivity'
import { initProps, normalizePropsOptions } from './componentProps'

export function createComponentInstance(vnode) {
  const { type } = vnode

  const instance = {
    type,
    vnode,
    render: null,
    setupState: null,
    propsOptions: normalizePropsOptions(type.props),
    props: {},
    attrs: {},
    subTree: null,
    isMounted: false,
  }

  return instance
}

export function setupComponent(instance) {
  const { type } = instance
  initProps(instance)
  const setupContext = createSetupContext(instance)
  const setupResult = proxyRefs(type.setup(instance.props, setupContext))
  instance.setupState = setupResult
  instance.render = type.render
}

function createSetupContext(instance) {
  return {
    get attrs() {
      return instance.attrs
    },
  }
}
