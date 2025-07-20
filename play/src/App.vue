<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useCounterStore from '@/stores/counter'
import useUserStore from '@/stores/user'

const counterStore = useCounterStore()
const userStore = useUserStore()

const { count, double } = storeToRefs(counterStore)
const { age } = storeToRefs(userStore)
</script>

<template>
  <div>
    <div>
      <button @click="counterStore.increment">
        +
      </button>
      count: {{ count }} -- double: {{ double }}
      <button @click="counterStore.decrement">
        -
      </button>
    </div>

    <div>
      {{ age }}

      <button @click="userStore.increment">
        +
      </button>
      <button @click="userStore.decrement">
        -
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>
