import { isArray, isString, ShapeFlags } from '@vue/shared'

export function createVNode(type: any, props?: any, children = null) {
  let shapeFlag

  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
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
