import { NodeTypes } from './ast'
import { Tokenizer } from './tokenizer'

let currentInput = ''
let currentRoot = null
let currentOpenTag

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
  onclosetagname(start, end) {
    const name = getSlice(start, end)
    const lastNode = stack.pop()

    if (lastNode.tag === name) {
      setLocEnd(lastNode.loc, end + 1)
    }
    else {
    // 标签写错了
      console.error('tag name error')
    }
  },
})

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
  currentInput = input
  const root = createRoot(input)
  currentRoot = root
  /**
   * 开始解析 input
   */

  tokenizer.parse(input)

  return root
}
