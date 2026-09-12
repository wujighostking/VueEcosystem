/* eslint-disable unused-imports/no-unused-vars,no-empty */
import { PatchFlags } from '@vue/shared'
import { createCallExpression, NodeTypes } from './ast'
import { parse } from './parse'
import { CREATE_TEXT, TO_DISPLAY_STRING } from './runtime-helper'

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

function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}

function transformElement(node, ctx) {
  if (node.type === NodeTypes.ELEMENT) {}
}

function transformText(node, ctx) {
  if (node.type === NodeTypes.TEXT) {
    return () => {
      const children = node.children
      const _children = []
      let hasText = false

      for (const child of children) {
        hasText = true
        const last = _children.at(-1)
        if (last && isText(child) && (isText(last) || last.type === NodeTypes.COMPOUND_EXPRESSION)) {
          if (last.type !== NodeTypes.COMPOUND_EXPRESSION) {
            _children[_children.length - 1] = {
              type: NodeTypes.COMPOUND_EXPRESSION,
              children: [last],
            }
          }

          _children[_children.length - 1].children.push('+', child)
        }
        else {
          _children.push(child)
        }
      }

      const l = _children.length
      /**
       * 只有在存在文本节点，并且 _children 的长度大于1
       */
      if (hasText && l > 1) {
        for (let i = 1; i < l; i++) {
          const child = _children[i]
          if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) {
            const args = [child]

            /**
             * patchFlag
             */

            if (child.type !== NodeTypes.TEXT) {
              args.push(PatchFlags.TEXT)
            }

            _children[i] = {
              type: NodeTypes.TEXT_CALL,
              content: child,
              codegenNode: createCallExpression(ctx.helper(CREATE_TEXT), args),
            }
          }
        }
      }

      node.children = _children
    }
  }
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
