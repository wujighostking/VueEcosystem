<script setup lang="ts">
import useCounterStore from '@/stores/counter'

const store = useCounterStore()
</script>

<template>
  <div>
    <button>{{ store.count }}</button>
  </div>
</template>

<style scoped>

</style>
