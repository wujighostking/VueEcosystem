<script setup lang="ts">
import useCounterStore from '@/stores/counter'

const store = useCounterStore()
</script>

<template>
  <div>
    <button @click="store.increment">
      +
    </button>
    count: {{ store.count }} -- double: {{ store.double }}
    <button @click="store.decrement">
      -
    </button>
  </div>
</template>

<style scoped>

</style>
