<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

function handleClick() {
  router.replace('/')
}
</script>

<template>
  <div>
    <button @click="handleClick">
      replace
    </button>
    <div>
      {{ route }}
    </div>
  </div>
</template>

<style scoped>

</style>
