import { defineStore } from 'pinia'
import { ref } from 'vue'

const useUserStore = defineStore('user', () => ({
  age: ref(0),
  increment() {
    this.age++
  },
  decrement() {
    this.age--
  },
}))

export default useUserStore
