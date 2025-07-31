export function isObject(value: any) {
  return typeof value === 'object' && value !== null
}

export const isArray = Array.isArray

export function isNumber(value: any) {
  return typeof value === 'number'
}

export function isString(value: any) {
  return typeof value === 'string'
}
