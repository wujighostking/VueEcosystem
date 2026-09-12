import { setCurrentRenderingInstance, unsetCurrentInstance } from '@vue/runtime-core'
import { hasChanged, ShapeFlags } from '@vue/shared'

function hasPropsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)

  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true
  }

  for (const key of nextKeys) {
    if (hasChanged(prevProps[key], nextProps[key])) {
      return true
    }
  }
}

export function shouldUpdateComponent(n1, n2) {
  const { props: prevProps, children: prevChildren } = n1
  const { props: nextProps, children: nextChildren } = n2

  if (prevChildren || nextChildren) {
    return true
  }

  if (!prevProps) {
    // 老的没有，新的有，需要更新
    // 老的没有，新的没有，不需要更新
    return !!nextProps
  }

  if (!nextProps) {
    // 老的有，新的没有，需要更新
    return true
  }

  return hasPropsChanged(prevProps, nextProps)
}

export function renderComponentRoot(instance) {
  const { vnode } = instance

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    setCurrentRenderingInstance(instance)
    const subTree = instance.render.call(instance.proxy, instance.proxy)
    unsetCurrentInstance()

    return subTree
  }
  else {
  //   函数式组件
    return vnode.type(instance.props, {
      get attrs() {
        return instance.attrs
      },
      get slots() {
        return instance.slots
      },
      get emit() {
        return instance.emit
      },
    })
  }
}
