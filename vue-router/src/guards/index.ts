type GuardCallback = (to: string, from: string, next: () => void) => void

export function useCallback() {
  const handlers: GuardCallback[] = []

  function add(handler: GuardCallback) {
    handlers.push(handler)
  }

  return {
    add,
    list: () => handlers,
  }
}
