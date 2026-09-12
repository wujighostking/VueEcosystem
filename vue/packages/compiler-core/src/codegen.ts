import { isArray, isString } from '@vue/shared'
import { NodeTypes } from './ast'
import { helperNameMap, OPEN_BLOCK } from './runtime-helper'

function createCodegenContext(ast) {
  const context = {
    ast,
    code: '',
    indentLevel: 0,
    helper(name) {
      return `_${helperNameMap[name]}`
    },
    push(code) {
      context.code += code
    },
    indent() {
      newLine(++context.indentLevel)
    },
    deindent() {
      newLine(--context.indentLevel)
    },
    newline() {
      newLine(context.indentLevel)
    },
  }

  return context

  function newLine(n) {
    context.push(`\n${'  '.repeat(n)}`)
  }
}

function genFunction(ast, ctx) {
  const helpers = [...ast.helpers].map((name) => {
    return ` ${helperNameMap[name]}: ${ctx.helper(name)}`
  })

  ctx.push(`const {${helpers}} = Vue`)
  ctx.newline()
  ctx.newline()
  ctx.push(`return function render(_ctx) {`)
  ctx.newline()
  ctx.newline()
}

function genText(node, ctx) {
  ctx.push(JSON.stringify(node.content))
}

function genNodeListAsArray(nodes, ctx) {
  ctx.push('[')
  genNodeList(nodes, ctx)
  ctx.push(']')
}

function genNodeList(nodes, ctx) {
  nodes.forEach((node, i) => {
    if (node == null) {
      ctx.push('null')
    }
    else if (isString(node)) {
      ctx.push(node)
    }
    else if (isArray(node)) {
      genNodeListAsArray(node, ctx)
    }
    else {
      genNode(node, ctx)
    }

    if (i < nodes.length - 1) {
      ctx.push(',')
    }
  })
}

function genVNodeCall(node, ctx) {
  const { isBlock, tag, props, children, callee } = node

  if (isBlock) {
    ctx.push(`(${ctx.help(OPEN_BLOCK)}(), `)
  }
  const helper = ctx.helper(callee)
  ctx.push(`${helper}(`)

  const args = [JSON.stringify(tag), props]
  if (children.length) {
    args.push(children)
  }
  else {
    if (!props) {
      args.pop()
    }
  }

  genNodeList(args, ctx)

  ctx.push(')')
  if (isBlock) {
    ctx.push(')')
  }
}

function genInterpolation(node, ctx) {
  genNode(node.content.content, ctx)
}

function genObjectExpression(node, ctx) {
  const { properties } = node

  ctx.push('{')

  properties.forEach((prop, index) => {
    const { key, value } = prop

    ctx.push(`${key.content}: ${JSON.stringify(value.content)}`)

    if (index < properties.length - 1) {
      ctx.push(',')
    }
  })

  ctx.push('}')
}

function genNode(node, ctx) {
  switch (node.type) {
    case NodeTypes.TEXT: {
      genText(node, ctx)
      break
    }
    case NodeTypes.VNODE_CALL: {
      genVNodeCall(node, ctx)
      break
    }
    case NodeTypes.INTERPOLATION: {
      genInterpolation(node, ctx)
      break
    }
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, ctx)
      break
  }
}

export function generate(ast) {
  const ctx = createCodegenContext(ast)

  genFunction(ast, ctx)
  ctx.indent()
  ctx.push('return ')

  /**
   * 处理 render 函数返回的虚拟 DOM 逻辑
   */

  genNode(ast.codegenNode, ctx)

  ctx.newline()
  ctx.newline()
  ctx.deindent()

  ctx.push('}')

  return ctx.code
}
