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
}

export function tracked(dep: Dependency) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

function link(dep: Dependency, sub: Subscribe) {
  const currentDep = sub.depsTail
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep

  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    return
  }

  const link: Link = {
    sub,
    prevSub: undefined,
    nextSub: undefined,

    dep,
    nextDep,
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

function propagate(subs: Link) {
  let link: Link | undefined = subs

  const queuedEffect: any[] = []

  while (link) {
    queuedEffect.push(link.sub)

    link = link.nextSub
  }

  queuedEffect.forEach((effect: ReactiveEffect) => {
    effect.notify()
  })
}

export function startTrack(sub: Subscribe) {
  sub.depsTail = undefined
}

export function endTrack(sub: Subscribe) {
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

export function clearTracking(link: Link) {
  while (link) {
    const { prevSub, nextSub, dep, nextDep } = link

    if (prevSub) {
      link.nextSub = prevSub
      link.nextSub = undefined
    }
    else {
      dep.subs = nextSub
    }

    if (nextSub) {
      nextSub.prevSub = prevSub
      link.prevSub = undefined
    }
    else {
      dep.subsTail = prevSub
    }
    link.dep = link.sub = undefined
    link.nextDep = undefined
    link = nextDep
  }
}
