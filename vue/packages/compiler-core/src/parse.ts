import { NodeTypes } from './ast'
import { Tokenizer } from './tokenizer'

let currentInput = ''
let currentRoot = null

const tokenizer = new Tokenizer({
  onText(start, end) {
    const content = getSlice(start, end)
    const textNode = {
      content,
      type: NodeTypes.TEXT,
      loc: getLoc(start, end),
    }

    currentRoot.children.push(textNode)
  },
})

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
