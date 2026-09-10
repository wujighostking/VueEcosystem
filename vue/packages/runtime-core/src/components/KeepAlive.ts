import { ShapeFlags } from '@vue/shared'
import { getCurrentInstance } from '../component'

export const isKeepAlive = type => type?.__isKeepAlive

export const KeepAlive = {
  __isKeepAlive: true,
  props: ['max'],
  setup(props, { slots }) {
    const instance = getCurrentInstance()
    const { options, unmount } = instance.ctx.renderer
    const { createElement, insert } = options

    const cache = new LRUCache(props.max)

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

      const _vnode = cache.set(key, vnode)
      if (_vnode) {
      //   卸载
        resetShapeFlag(_vnode)
        unmount(_vnode)
      }

      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

      return vnode
    }
  },
}

function resetShapeFlag(vnode) {
  vnode.shapeFlag &= ~ShapeFlags.COMPONENT_KEPT_ALIVE
  vnode.shapeFlag &= ~ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
}

class LRUCache {
  cache = new Map()
  max: number
  constructor(max = Infinity) {
    this.max = max
  }

  get(key) {
    if (!this.cache.has(key))
      return

    const value = this.cache.get(key)

    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  set(key, value) {
    let vnode

    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else {
      if (this.cache.size >= this.max) {
        const firstKey = this.cache.keys().next().value
        vnode = this.cache.get(firstKey)
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, value)

    return vnode
  }
}
