import { defineStore } from 'pinia'

const useUserStore = defineStore('user', () => ({
  age: 0,
  increment() {
    this.age++
  },
  decrement() {
    this.age--
  },
}))

export default useUserStore
