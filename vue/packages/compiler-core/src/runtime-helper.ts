export const TO_DISPLAY_STRING = Symbol('toDisplayString')
export const CREATE_TEXT = Symbol('createTextVNode')
export const CREATE_VNODE = Symbol('createElementVNode')

export const helperNameMap = {
  [TO_DISPLAY_STRING]: 'toDisplayString',
  [CREATE_TEXT]: 'createTextVNode',
  [CREATE_VNODE]: 'createElementVNode',
}
