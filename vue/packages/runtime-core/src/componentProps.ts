import { reactive } from '@vue/reactivity'
import { hasOwn, isArray } from '@vue/shared'

export function normalizePropsOptions(props = {}) {
  /**
   * 数组 ==> 对象
   */

  if (isArray(props)) {
    props = props.reduce((prev, cur) => {
      prev[cur] = {}
      return prev
    }, {})
  }

  return props
}

export function initProps(instance) {
  const { vnode } = instance
  const rawProps = vnode.props

  const props = {}
  const attrs = {}

  setFullProps(instance, rawProps, props, attrs)

  instance.props = reactive(props)
  instance.attrs = attrs
}

function setFullProps(instance, rawProps, props, attrs) {
  const propsOptions = instance.propsOptions
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key]
      if (hasOwn(propsOptions, key)) {
        props[key] = value
      }
      else {
        attrs[key] = value
      }
    }
  }
}

export function updateProps(instance, nextVNode) {
  const { props, attrs } = instance

  const rawProps = nextVNode.props

  setFullProps(instance, rawProps, props, attrs)

  for (const key in props) {
    if (!hasOwn(rawProps, key)) {
      delete props[key]
    }
  }

  for (const key in attrs) {
    if (!hasOwn(rawProps, key)) {
      delete attrs[key]
    }
  }
}
