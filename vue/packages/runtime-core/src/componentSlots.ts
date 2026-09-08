import { ShapeFlags } from '@vue/shared'

export function initSlots(instance) {
  const { slots, vnode } = instance

  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    const { children } = vnode

    for (const key in children) {
      slots[key] = children[key]
    }
  }
}

export function updateSlots(instance, vnode) {
  const { slots } = instance

  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    const { children } = vnode

    for (const key in children) {
      slots[key] = children[key]
    }

    for (const key in slots) {
      if (children[key] == null) {
        delete slots[key]
      }
    }
  }
}
