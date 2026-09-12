import { isString } from '@vue/shared'

export function patchStyle(el, prevValue, nextValue) {
  const style = el.style

  if (nextValue) {
    if (isString(nextValue)) {
      el.setAttribute('style', nextValue)
    }
    else {
      for (const key in nextValue) {
        style[key] = nextValue[key]
      }
    }
  }

  if (prevValue) {
    for (const key in prevValue) {
      if (nextValue?.[key] == null) {
        style[key] = null
      }
    }
  }
}
