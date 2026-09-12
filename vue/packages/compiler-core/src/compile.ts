import { generate } from './codegen'
import { parse } from './parse'
import { transform } from './transform'

export function compile(template) {
  const ast = parse(template)

  transform(ast)

  return generate(ast)
}
