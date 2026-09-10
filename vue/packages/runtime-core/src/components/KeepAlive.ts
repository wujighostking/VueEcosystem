import { ShapeFlags } from '@vue/shared'
import { getCurrentInstance } from '../component'

export const isKeepAlive = type => type?.__isKeepAlive

export const KeepAlive = {
  __isKeepAlive: true,
  setup(props, { slots }) {
    const instance = getCurrentInstance()
    const { options } = instance.ctx.renderer
    const { createElement, insert } = options

    const cache = new Map()

    const storageContainer = createElement('div')

    /**
     * 激活的时候，在 renderer.ts 中调用这个方法
     * @param vnode
     */
    instance.ctx.activate = (vnode, container, anchor) => {
      insert(vnode.el, container, anchor)
    }

    instance.ctx.deactivate = (vnode) => {
      insert(vnode.el, storageContainer)
    }

    return () => {
      const vnode = slots.default?.()

      const key = vnode.key != null ? vnode.key : vnode.type

      const cacheVNode = cache.get(key)
      if (cacheVNode) {
        vnode.component = cacheVNode.component
        vnode.el = cacheVNode.el
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
      }

      cache.set(key, vnode)

      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

      return vnode
    }
  },
}
