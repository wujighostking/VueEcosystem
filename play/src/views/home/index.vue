<script setup lang="ts">

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
