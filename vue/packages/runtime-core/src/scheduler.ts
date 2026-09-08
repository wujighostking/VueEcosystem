const queueJobSet = new Set()

const resolvePromise = Promise.resolve()

export function queueJob(job) {
  if (queueJobSet.has(job)) {
    return
  }

  queueJobSet.add(job)
  resolvePromise.then(() => {
    job()
    queueJobSet.delete(job)
  })
}

export function nextTick(fn) {
  return resolvePromise.then(() => fn.call(this))
}
