<script setup lang="ts">
import type { InputInstance, InputProps } from 'element-plus'
import { ElInput } from 'element-plus'
import { getCurrentInstance, h } from 'vue'

const props = defineProps<Partial<InputProps>>()

const vm = getCurrentInstance()!
function changeRef(inputInstance: InputInstance) {
  vm.exposeProxy = vm.exposed = inputInstance || {}
}
</script>

<template>
  <div>
    <div>这是二次封装的组件</div>

    <div style="width: 200px;">
      <component :is="h(ElInput, { ...$attrs, ...props, ref: changeRef }, $slots)" />
    </div>

    <slot name="custom" />
  </div>
</template>

<style scoped>

</style>
