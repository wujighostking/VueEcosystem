import type { ComputedRefImpl } from './computed'
import type { ReactiveEffect } from './effect'
import { activeSub } from './effect'

export interface Link {
  sub: Subscribe | undefined
  prevSub: Link | undefined
  nextSub: Link | undefined

  dep: Dependency | undefined
  nextDep: Link | undefined
}

export interface Dependency {
  subs: Link | undefined
  subsTail: Link | undefined
}

export interface Subscribe {
  deps: Link | undefined
  depsTail: Link | undefined
  tracking: boolean
}

export function tracked(dep: Dependency) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

let linkPool: Link | undefined

export function link(dep: Dependency, sub: Subscribe) {
  const currentDep = sub.depsTail
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep

  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    return
  }

  let link: Link

  if (linkPool) {
    link = linkPool
    linkPool = linkPool.nextDep

    link.sub = sub
    link.dep = dep
    link.nextDep = nextDep
  }
  else {
    link = {
      sub,
      prevSub: undefined,
      nextSub: undefined,

      dep,
      nextDep,
    }
  }

  if (dep.subsTail) {
    dep.subsTail.nextSub = link
    link.prevSub = dep.subsTail
    dep.subsTail = link
  }
  else {
    dep.subs = link
    dep.subsTail = link
  }

  if (sub.depsTail) {
    sub.depsTail.nextDep = link
    sub.depsTail = link
  }
  else {
    sub.deps = link
    sub.depsTail = link
  }
}

export function trigger(dep: Dependency) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}

export function propagate(subs: Link | undefined) {
  let link = subs

  const queuedEffect: any[] = []

  while (link) {
    const sub = link.sub
    if (!sub?.tracking) {
      if ('update' in sub!) {
        processComputedUpdate(sub as any)
      }
      else {
        queuedEffect.push(sub)
      }
    }
    link = link.nextSub
  }

  queuedEffect.forEach((effect: ReactiveEffect) => {
    effect.notify()
  })
}

export function startTrack(sub: Subscribe) {
  sub.tracking = true
  sub.depsTail = undefined
}

export function endTrack(sub: Subscribe) {
  sub.tracking = false
  const depsTail = sub.depsTail

  if (depsTail) {
    if (depsTail.nextDep) {
      clearTracking(depsTail.nextDep)
      depsTail.nextDep = undefined
    }
  }
  else if (sub.deps) {
    clearTracking(sub.deps)
    sub.deps = undefined
  }
}

export function clearTracking(link: Link | undefined) {
  while (link) {
    const { prevSub, nextSub, dep, nextDep } = link

    if (prevSub) {
      link.nextSub = prevSub
      link.nextSub = undefined
    }
    else {
      dep!.subs = nextSub
    }

    if (nextSub) {
      nextSub.prevSub = prevSub
      link.prevSub = undefined
    }
    else {
      dep!.subsTail = prevSub
    }
    link.dep = link.sub = undefined
    link.nextDep = linkPool
    linkPool = link
    link = nextDep
  }
}

export function processComputedUpdate(sub: ComputedRefImpl & Dependency) {
  if (sub && sub.update()) {
    propagate(sub.subs)
  }
}
