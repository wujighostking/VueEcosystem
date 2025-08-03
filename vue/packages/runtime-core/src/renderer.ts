/* eslint-disable unused-imports/no-unused-vars */
import { ShapeFlags } from '@vue/shared'
import { isSameVNodeType } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    createText: hostCreateText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = options

  function unmount(vnode) {
    const { type, shapeFlag, children } = vnode

    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点是数组

      unmountChildren(children)
    }

    hostRemove(vnode.el)
  }

  /**
   *
   * @param n1 老节点 ，如果有，则和 n2 做 diff 更新，如果没有，则直接挂载
   * @param n2 新节点
   * @param container 要挂载的容器
   */
  function patch(n1, n2, container, anchor = null) {
    if (n1 === n2)
      return

    if (n1 && !isSameVNodeType(n1, n2)) {
      // 如果两个节点不是同一个类型，卸载 n1 ，直接挂载 n2
      unmount(n1)
      n1 = null
    }

    if (n1 == null) {
      mountElement(n2, container, anchor)
    }
    else {
      patchElement(n1, n2)
    }
  }

  function mountElement(vnode, container, anchor) {
    /**
     * 1.创建一个 dom 元素
     * 2.设置它的 props
     * 3.挂载它的子节点
     */

    const { type, props, children, shapeFlag } = vnode
    const el = (vnode.el = hostCreateElement(type))

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 挂载子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 子节点是文本
      hostSetElementText(el, children)
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点是数组
      mountChildren(el, children)
    }

    hostInsert(el, container, anchor)
  }

  function mountChildren(el, children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      patch(null, child, el)
    }
  }

  function patchElement(n1, n2) {
    /**
     * 1.复用 dom 元素
     * 2.更新 props
     * 3.更新 children
     */

    const el = (n2.el = n1.el)
    const oldProps = n1.props
    const newProps = n2.props

    // 更新 props
    patchProps(el, oldProps, newProps)

    // 更新子节点 children
    patchChildren(n1, n2)
  }

  function patchChildren(n1, n2) {
    /**
     * 1.新节点的子节点是文本
     *  1.2 老的是数组
     *  1.1 老的是文本
     * 2.新节点的子节点是数组
     *  2.1 老的是文本
     *  2.2 老的是数组
     */

    const el = n2.el
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是数组，把老的 children 卸载掉
        unmountChildren(n1.children)
      }

      if (n1.children !== n2.children) {
        // 设置文本，如果 n1 和 n2 的 children 不一样
        hostSetElementText(el, n2.children)
      }
    }
    else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 把老的文本干掉
        hostSetElementText(el, '')

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 挂载新的节点
          mountChildren(el, n2.children)
        }
      }
      else {
        // 老的是数组 或者 null
        // 新的还是 数组 或者 null

        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 老的是数组
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 新的是数组
            // TODO 全量 diff

            patchKeyedChildren(n1.children, n2.children, el)
          }
          else {
            // 新的不是数组，卸载老的数组
            unmountChildren(n1.children)
          }
        }
        else {
          // 老的是 null
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 新的是数组，挂载新的
            mountChildren(el, n2.children)
          }
        }
      }
    }
  }

  function patchProps(el, oldProps, newProps) {
    /**
     * 1.把老的 props 全删掉
     * 2.把新的 props 全部设置上
     */

    if (oldProps) {
      for (const key in oldProps) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }

    if (newProps) {
      for (const key in newProps) {
        hostPatchProp(el, key, oldProps?.[key], newProps[key])
      }
    }
  }

  // 卸载子元素
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  function patchKeyedChildren(c1, c2, container) {
    /**
     * 1.双端 diff
     *  1.1 头部对比
     */

    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    // 头部对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container)
      }
      else {
        break
      }

      i++
    }

    // 尾部对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container)
      }
      else {
        break
      }

      e1--
      e2--
    }

    if (i > e1) {
      /**
       * 表示老的少，新的多，要挂载新的，挂载的范围是 i - e2
       */

      const nextPos = e2 + 1
      const anchor = nextPos < c2.length ? c2[nextPos].el : null

      while (i <= e2) {
        patch(null, c2[i++], container, anchor)
      }
    }
    else if (i > e2) {
      /**
       *  表示老的多，新的少，要把老的里面多余的卸载掉，卸载的范围是 i - e1
       */

      while (i <= e1) {
        unmount(c1[i++])
      }
    }

    // eslint-disable-next-line no-console
    console.log(i, e1, e2)
  }

  const render = (vnode, container) => {
    /**
     * 1.挂载
     * 2.更新
     * 3.卸载
     */

    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    }
    else {
      // 挂载和更新
      patch(container._vnode || null, vnode, container)

      container._vnode = vnode
    }
  }

  return {
    render,
  }
}

function getSequence(arr: number[]) {
  const res = []
  const map = new Map()
  for (let i = 0; i < arr.length; i++) {
    if (res.length === 0) {
      res.push(i)
      continue
    }

    const item = arr[i]
    const lastIndex = res[res.length - 1]
    if (item > arr[lastIndex]) {
      res.push(i)
      map.set(i, lastIndex)
      continue
    }

    let start = 0
    let end = res.length - 1
    while (start < end) {
      const mid = ((start + end) / 2) | 0
      if (arr[res[mid]] < item) {
        start = mid + 1
      }
      else {
        end = mid
      }
    }

    if (arr[res[start]] > item) {
      if (start > 0) {
        map.set(i, res[start - 1])
      }

      res[start] = i
    }
  }
  let l = res.length
  let last = res[l - 1]
  while (l-- > 0) {
    res[l] = last

    last = map.get(last)
  }

  return res
}

// -1, -1, 1, 2,  3, 2,  4, 6
// 10, 3, 5, 9, 12, 8, 15, 18
// 0,  1, 2, 3, 4,  5, 6,  7

// 3,5,9,12,15,18
// 1,2,3,4, 6, 7
// eslint-disable-next-line no-console
console.log(getSequence([10, 3, 5, 9, 12, 8, 15, 18]))

// -1,0, -1,1, 3, 4, 4, 6, 1
// 2, 3, 1, 5, 6, 8, 7, 9, 4
// 0, 1, 2, 3, 4, 5, 6, 7, 8

// 2, 3, 5, 6, 7, 9
// 0, 1, 3, 4, 6, 7
// eslint-disable-next-line no-console
console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]))
