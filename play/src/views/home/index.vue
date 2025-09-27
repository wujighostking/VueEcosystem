<script setup lang="ts">
// import { beforeRouteEnter, beforeRouteUpdate, beforeRouteLeave } from 'vue-router'

// beforeRouteEnter(to, from, next) {
//   console.log('beforeRouteEnter')
// }

// beforeRouteUpdate(to, from, next) {
//   console.log('beforeRouteUpdate')
// }

// beforeRouteLeave(to, from, next) {
//   console.log('beforeRouteLeave')
// }
</script>

<template>
  <div>
    home
    <hr>

    <router-link to="/a">
      A页面
    </router-link>
    <router-link to="/b">
      B页面
    </router-link>

    <router-view />
  </div>
</template>

<style scoped>

</style>
