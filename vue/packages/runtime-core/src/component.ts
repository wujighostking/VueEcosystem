import { proxyRefs } from '@vue/reactivity'

export function createComponentInstance(vnode) {
  const { type } = vnode

  const instance = {
    type,
    vnode,
    render: null,
    setupState: null,
    props: {},
    attrs: {},
    subTree: null,
    isMounted: false,
  }

  return instance
}

export function setupComponent(instance) {
  const { type } = instance

  const setupResult = proxyRefs(type.setup())
  instance.setupState = setupResult
  instance.render = type.render
}
