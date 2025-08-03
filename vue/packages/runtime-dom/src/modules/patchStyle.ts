export function patchStyle(el, prevValue, nextValue) {
  const style = el.style

  if (nextValue) {
    for (const key in nextValue) {
      style[key] = nextValue[key]
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
