type Callback = ((...args: any[]) => any)

export class Mitt {
  private events: Map<string, Callback[]> = new Map()

  on(name: string, callback: Callback) {
    ;(this.events ??= new Map()).set(name, [...(this.events.get(name) ?? []), callback])
  }

  emit(name: string, ...args: any[]) {
    this.events.get(name)?.forEach(callback => callback(...args))
  }

  off(name: string, handler: Callback) {
    this.events.set(name, this.events.get(name)?.filter(cb => cb !== handler) ?? [])
  }

  once(name: string, handler: Callback) {
    const onceHandler = (...args: any[]) => {
      handler(...args)
      this.off(name, onceHandler)
    }
    this.on(name, onceHandler)
  }

  get all() {
    const clear = () => {
      this.events.clear()
    }

    return { clear }
  }
}
