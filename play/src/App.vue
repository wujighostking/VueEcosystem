<script setup lang="ts">
import useCounterStore from '@/stores/counter'
import useUserStore from '@/stores/user'

const counterStore = useCounterStore()
const userStore = useUserStore()
</script>

<template>
  <div>
    <div>
      <button @click="counterStore.increment">
        +
      </button>
      count: {{ counterStore.count }} -- double: {{ counterStore.double }}
      <button @click="counterStore.decrement">
        -
      </button>
    </div>

    <div>
      {{ userStore.count }}

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
