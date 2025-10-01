import { Mitt } from './mitt'

let _mitt: Mitt

export function mitt() {
  return _mitt ??= new Mitt()
}
