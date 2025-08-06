<script setup lang="ts">
import { ref } from 'vue'
// import { storeToRefs } from 'pinia'
// import useCounterStore from '@/stores/counter'
// import useUserStore from '@/stores/user'
//
// const counterStore = useCounterStore()
// const userStore = useUserStore()
//
// const { count, double } = storeToRefs(counterStore)
// const { age } = storeToRefs(userStore)
// const { increment } = userStore
//
// function handleReset() {
//   counterStore.$reset()
// }
//
// function handleDispose1() {
//   userStore.$dispose()
// }
//
// function handleClick() {
//   console.log('11111111')
// }
import MyInput from '@/components/MyInput.vue'

const inputRef = ref()
const inputValue = ref('1111')

function clearValue() {
  inputRef.value.clear()
}
</script>

<template>
  <div>
    <!--    <div> -->
    <!--      count: {{ count }} &#45;&#45; double: {{ double }} -->
    <!--      <button @click="counterStore.decrement"> -->
    <!--        - -->
    <!--      </button> -->
    <!--      <button @click="counterStore.increment"> -->
    <!--        + -->
    <!--      </button> -->

    <!--      <button @click="handleReset"> -->
    <!--        重置 -->
    <!--      </button> -->
    <!--    </div> -->

    <!--    <div> -->
    <!--      {{ age }} -->

    <!--      <button @click="increment"> -->
    <!--        + -->
    <!--      </button> -->
    <!--      <button @click="userStore.decrement"> -->
    <!--        - -->
    <!--      </button> -->

    <!--      <button @click="handleDispose1"> -->
    <!--        销毁 -->
    <!--      </button> -->
    <!--    </div> -->

    <!--    <button @click="handleClick"> -->
    <!--      点击打印 -->
    <!--    </button> -->

    <div>
      <img v-for="i in 5" :key="i" width="100px" src="./assets/image1.jpg" alt="">
      <img width="100px" src="http://www.baidu.com/assets/image2.jpg" alt="image2">
      <img width="100px" src="http://www.baidu.com/assets/image3.jpg" alt="image3">
    </div>
  </div>

  <MyInput ref="inputRef" v-model="inputValue">
    <template #custom>
      <div>这是一个自定义的插槽组件</div>
    </template>

    <template #append>
      <div>
        <el-button type="primary" @click="clearValue">
          clear
        </el-button>
      </div>
    </template>
  </MyInput>
</template>

<style scoped>

</style>
