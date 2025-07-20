<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useCounterStore from '@/stores/counter'
import useUserStore from '@/stores/user'

const counterStore = useCounterStore()
const userStore = useUserStore()

const { count, double } = storeToRefs(counterStore)
const { age } = storeToRefs(userStore)
const { increment } = userStore

function handleReset() {
  counterStore.$reset()
}

function handleDispose1() {
  userStore.$dispose()
}
</script>

<template>
  <div>
    <div>
      count: {{ count }} -- double: {{ double }}
      <button @click="counterStore.decrement">
        -
      </button>
      <button @click="counterStore.increment">
        +
      </button>

      <button @click="handleReset">
        重置
      </button>
    </div>

    <div>
      {{ age }}

      <button @click="increment">
        +
      </button>
      <button @click="userStore.decrement">
        -
      </button>

      <button @click="handleDispose1">
        销毁
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
