import { createObjectExpression, createObjectProperty, createSimpleExpression, createVNodeCall, NodeTypes } from '../ast'
import { CREATE_VNODE } from '../runtime-helper'

export function transformElement(node, ctx) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children, tag, props } = node

      const _props = buildProps(props)
      const codegenNode = createVNodeCall(ctx.helper(CREATE_VNODE), tag, _props, children)
      node.codegenNode = codegenNode
    }
  }
}

function buildProps(props) {
  if (!props)
    return

  const properties = props.reduce((acc, current) => {
    const key = createSimpleExpression(current.name.replace(/^:/, ''))
    const value = createSimpleExpression(current.value, !current.name.startWith(':'))

    const property = createObjectProperty(key, value)

    acc.push(property)

    return acc
  }, [])

  return createObjectExpression(properties)
}
