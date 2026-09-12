import { NodeTypes } from './ast'
import { parse } from './parse'
import { TO_DISPLAY_STRING } from './runtime-helper'
import { transformElement } from './transforms/transformElement'
import { transformExpression } from './transforms/transformExpression'
import { transformText } from './transforms/transformText'

function traverseChildren(node, ctx) {
  node.children.forEach((child) => {
    node.parent = node
    traverseNode(child, ctx)
  })
}

function traverseNode(node, ctx) {
  const nodeTransforms = ctx.nodeTransforms
  ctx.currentNode = node
  const exits = []

  nodeTransforms.forEach((cb) => {
    const exit = cb(node, ctx)
    exit && exits.push(exit)
  })

  switch (node.type) {
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:{
      traverseChildren(node, ctx)
      break
    }

    case NodeTypes.INTERPOLATION: {
      ctx.helper(TO_DISPLAY_STRING)
      break
    }
  }

  ctx.currentNode = node
  while (exits.length) {
    exits.pop()()
  }
}

function createTransformContext(root) {
  const ctx = {
    root,
    currentNode: root,
    parentNode: null,
    nodeTransforms: [transformExpression, transformElement, transformText],
    helpers: new Set(),
    helper(name) {
      ctx.helpers.add(name)

      return name
    },
  }

  return ctx
}

function transform(root) {
  const ctx = createTransformContext(root)

  traverseNode(root, ctx)
}

export function compile(template) {
  const ast = parse(template)

  transform(ast)
}
