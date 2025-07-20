import { defineStore } from 'pinia'

const useUserStore = defineStore('user', () => ({
  count: 0,
  increment() {
    this.count++
  },
  decrement() {
    this.count--
  },
}))

export default useUserStore
