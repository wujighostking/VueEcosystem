export function plugin({ store, id }: { store: any, id: string }) {
  const state = JSON.parse(localStorage.getItem(id)!)
  if (state) {
    store.$state = state
  }

  store.$subscribe((state: any, id: string) => {
    localStorage.setItem(id, JSON.stringify(state))
  })
}
