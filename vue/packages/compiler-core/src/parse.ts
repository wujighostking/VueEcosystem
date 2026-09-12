import { NodeTypes } from './ast'
import { isWhitespace, Tokenizer } from './tokenizer'

let currentInput = ''
let currentRoot
let currentOpenTag
let currentProps

function reset() {
  currentInput = ''
  currentRoot = undefined
  currentOpenTag = undefined
  currentProps = undefined
}

const stack = []
function addNode(node) {
  ;(stack.at(-1) || currentRoot).children.push(node)
}

const tokenizer = new Tokenizer({
  ontext(start, end) {
    const content = getSlice(start, end)
    const textNode = {
      content,
      type: NodeTypes.TEXT,
      loc: getLoc(start, end),
    }

    addNode(textNode)
  },
  onopentagname(start, end) {
    const tag = getSlice(start, end)
    currentOpenTag = {
      type: NodeTypes.ELEMENT,
      tag,
      children: [],
      loc: getLoc(start - 1, end),
    }
  },
  onopentagend() {
    addNode(currentOpenTag)
    stack.push(currentOpenTag)
    currentOpenTag = null
  },
  onclosetag(start, end) {
    const name = getSlice(start, end)
    const lastNode = stack.pop()

    if (lastNode.tag === name) {
      setLocEnd(lastNode.loc, end + 1)
    }
    else {
    // 标签写错了
      console.error('tag name error')
    }

    lastNode.children = condenseWhitespace(lastNode.children)
  },
  onattrname(start, end) {
    currentProps = {
      name: getSlice(start, end),
      loc: getLoc(start, end),
      value: undefined,
    }
  },
  onattrvalue(start, end) {
    const value = getSlice(start, end)
    currentProps.value = value
    setLocEnd(currentProps.loc, end + 1)

    if (currentOpenTag) {
      if (!currentOpenTag.propw) {
        currentOpenTag.props = []
      }
      currentOpenTag.props.push(currentProps)
    }
  },
  oninterpolation(start, end) {
    let innerStart = start + 2
    let innerEnd = end - 1

    while (isWhitespace(currentInput[innerStart])) {
      innerStart++
    }

    while (isWhitespace(currentInput[innerEnd - 1])) {
      innerEnd--
    }

    addNode({
      type: NodeTypes.INTERPOLATION,
      loc: getLoc(start, end),
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: getSlice(innerStart, innerEnd),
        loc: getLoc(innerStart, innerEnd),
      },
    })
  },
})

function isAllWhitespace(str) {
  for (let i = 0; i < str.length; i++) {
    if (!isWhitespace(str[i])) {
      return false
    }
  }
  return true
}

function condenseWhitespace(children) {
  const _children = [...children]
  for (let i = 0; i < _children.length; i++) {
    const node = _children[i]
    if (node.type === NodeTypes.TEXT) {
      if (isAllWhitespace(node.content)) {
        if (i === 0 || i === _children.length - 1) {
          _children[i] = null
        }
        else {
          node.content = ' '
        }
      }
    }
  }

  return _children.filter(Boolean)
}

function setLocEnd(loc, end) {
  loc.source = getSlice(loc.start.offset, end)
  loc.end = tokenizer.getPos(end)
}

function getSlice(start, end) {
  return currentInput.slice(start, end)
}

function getLoc(start, end) {
  return {
    start: tokenizer.getPos(start),
    end: tokenizer.getPos(end),
    source: getSlice(start, end),
  }
}

function createRoot(source) {
  return {
    children: [],
    type: NodeTypes.ROOT,
    source,
  }
}

export function parse(input) {
  reset()
  currentInput = input
  const root = createRoot(input)
  currentRoot = root
  /**
   * 开始解析 input
   */

  tokenizer.parse(input)
  root.children = condenseWhitespace(root.children)

  return root
}
