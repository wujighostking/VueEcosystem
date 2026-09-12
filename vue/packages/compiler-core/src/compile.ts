/* eslint-disable unused-imports/no-unused-vars,no-empty */
import { NodeTypes } from './ast'
import { parse } from './parse'
import { TO_DISPLAT_STRING } from './runtime-helper'

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
    const exit = cb(node)
    exit && exits.push(exit)
  })

  switch (node.type) {
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:{
      traverseChildren(node, ctx)
      break
    }

    case NodeTypes.INTERPOLATION: {
      ctx.helper(TO_DISPLAT_STRING)
      break
    }
  }

  ctx.currentNode = node
  while (exits.length) {
    exits.pop()()
  }
}

function transformElement(node, ctx) {
  if (node.type === NodeTypes.ELEMENT) {}
}

function transformText(node, ctx) {
  if (node.type === NodeTypes.TEXT) {}
}

function transformExpression(node, ctx) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content.content = `_ctx.${node.content.content}`
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
