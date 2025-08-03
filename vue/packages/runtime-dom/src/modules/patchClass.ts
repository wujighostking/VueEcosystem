export function patchClass(el, value) {
  // eslint-disable-next-line eqeqeq
  if (value != void 0) {
    el.className = value
  }
  else {
    el.removeAttribute('class')
  }
}
