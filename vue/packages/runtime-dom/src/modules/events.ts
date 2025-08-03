function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e)
  }
  invoker.value = value

  return invoker
}

const eviKey = Symbol('_evi')
export function patchEvent(el, rawName, nextValue) {
  const name = rawName.slice(2).toLowerCase()
  const invokers = (el[eviKey] ??= {})
  const existingInvoker = invokers[rawName]

  if (nextValue) {
    if (existingInvoker) {
      existingInvoker.value = nextValue
      return
    }

    const invoker = createInvoker(nextValue)

    invokers[rawName] = invoker

    el.addEventListener(name, invoker)
  }
  else {
    if (existingInvoker) {
      el.removeEventListener(name, existingInvoker)
      invokers[rawName] = null
    }
  }
}
