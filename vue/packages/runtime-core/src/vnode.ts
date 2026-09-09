import { isArray, isFunction, isNumber, isObject, isString, ShapeFlags } from '@vue/shared'
import { getCurrentRenderingInstance } from './component'

function normalizeChildren(vnode, children) {
  let { shapeFlag } = vnode

  if (isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  else if (isObject(children)) {
    if (shapeFlag & ShapeFlags.COMPONENT) {
      shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  }
  else if (isFunction(children)) {
    /**
     * 默认插槽
     * children = () => h()
     */
    if (shapeFlag & ShapeFlags.COMPONENT) {
      shapeFlag |= ShapeFlags.SLOTS_CHILDREN
      children = { default: children }
    }
  }
  else if (isString(children) || isNumber(children)) {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
    children = String(children)
  }

  vnode.shapeFlag = shapeFlag
  vnode.children = children
}

function normalizeRef(ref) {
  if (ref == null)
    return

  return {
    r: ref,
    i: getCurrentRenderingInstance(),
  }
}

export function createVNode(type: any, props?: any, children = null) {
  let shapeFlag = 0

  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  }
  else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  }

  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,

    key: props?.key,
    el: null,
    shapeFlag,
    ref: normalizeRef(props?.ref),
  }

  normalizeChildren(vnode, children)

  return vnode
}

export function isVNode(value: any) {
  return !!value?.__v_isVNode
}

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export const Text = Symbol('v-text')
