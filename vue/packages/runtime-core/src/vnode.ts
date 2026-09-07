import { isArray, isNumber, isObject, isString, ShapeFlags } from '@vue/shared'

function normalizeChildren(children) {
  if (isNumber(children)) {
    children = String(children)
  }
  return children
}

export function createVNode(type: any, props?: any, children = null) {
  children = normalizeChildren(children)

  let shapeFlag = 0

  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  }
  else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  }

  if (isString(children)) {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }
  else if (isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,

    key: props?.key,
    el: null,
    shapeFlag,
  }

  return vnode
}

export function isVNode(value: any) {
  return !!value?.__v_isVNode
}

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export const Text = Symbol('v-text')
