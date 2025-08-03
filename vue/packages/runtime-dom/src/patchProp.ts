import { isOnEvent } from '@vue/shared'
import { patchEvent } from './modules/events'
import { patchAttr } from './modules/patchAttr'
import { patchClass } from './modules/patchClass'
import { patchStyle } from './modules/patchStyle'

/**
 * 1.class
 * 2.style
 * 3.event
 * 4.attrs
 *
 * @param el
 * @param key
 * @param prevValue
 * @param nextValue
 */
export function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    return patchClass(el, nextValue)
  }

  if (key === 'style') {
    return patchStyle(el, prevValue, nextValue)
  }

  if (isOnEvent(key)) {
    return patchEvent(el, key, nextValue)
  }

  patchAttr(el, key, nextValue)
}
