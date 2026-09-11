import { isRef } from '@vue/reactivity'
import { isArray, isFunction, isNumber, isObject, isString, ShapeFlags } from '@vue/shared'
import { getCurrentRenderingInstance } from './component'
import { isTeleport } from './components/Teleport'

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

export function createVNode(type: any, props?: any, children = null, patchFlag = 0, isBlock = false) {
  let shapeFlag = 0

  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  }
  else if (isTeleport(type)) {
    shapeFlag = ShapeFlags.TELEPORT
  }
  else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  }
  else if (isFunction(type)) {
  //   函数式组件
    shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
  }

  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    dynamicChildren: null,
    key: props?.key,
    el: null,
    shapeFlag,
    ref: normalizeRef(props?.ref),
    appContext: null,
    patchFlag,
  }

  // eslint-disable-next-line ts/no-use-before-define
  if (patchFlag > 0 && currentBlock && !isBlock) {
    // eslint-disable-next-line ts/no-use-before-define
    currentBlock.push(vnode)
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

export const Fragment = Symbol('v-fragment')

const blockStack = []
let currentBlock = null

export function openBlock() {
  currentBlock = []
  blockStack.push(currentBlock)
}

export function closeBlock() {
  blockStack.pop()
  currentBlock = blockStack.at(-1)
}

function setupBlock(vnode) {
  // 收集到的动态节点， 放到 vnode.dynamicChildren 中
  vnode.dynamicChildren = currentBlock

  closeBlock()
  if (currentBlock) {
    currentBlock.push(vnode)
  }
}

export function createElementBlock(type, props, children, patchFlag) {
  const vnode = createVNode(type, props, children, patchFlag, true)
  setupBlock(vnode)
  return vnode
}

export function renderList(list, cb) {
  return list.map(cb)
}

export function toDisplayString(val) {
  if (isString(val)) {
    return val
  }
  if (val == null) {
    return ''
  }

  if (isRef(val)) {
    return val.value
  }

  if (isObject(val)) {
    return JSON.stringify(val)
  }

  return String(val)
}
