import { createRenderer } from '@vue/runtime-core'
import { isString } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

export * from '@vue/runtime-core'

export const renderOptions = {
  patchProp,
  ...nodeOps,
}

const renderer = createRenderer(renderOptions)
export function render(vnode, container) {
  renderer.render(vnode, container)
}

export function createApp(rootComponent, rootProps) {
  const app = renderer.createApp(rootComponent, rootProps)
  const _mount = app.mount.bind(app)

  function mount(selector) {
    let el
    if (isString(selector)) {
      el = document.querySelector(selector)
    }

    _mount(el)
  }

  app.mount = mount

  return app
}
