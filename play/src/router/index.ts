import { createRouter, createWebHistory } from 'vue-router'

import About from '@/views/about/index.vue'
import A from '@/views/home/A.vue'
import B from '@/views/home/B.vue'
import Home from '@/views/home/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,

      children: [
        {
          path: 'a',
          name: 'a',
          component: A,
        },
        {
          path: 'b',
          name: 'b',
          component: B,
        },
      ],

      // beforeEnter(to, from, next) {
      //   console.log('beforeEnter', to, from)
      // },
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
})

router.beforeEach((to, from) => {
  // eslint-disable-next-line no-console
  console.log('beforeEach', to, from)
})

router.beforeResolve((to, from) => {
  // eslint-disable-next-line no-console
  console.log('beforeResolve', to, from)
})

router.afterEach((to, from) => {
  // eslint-disable-next-line no-console
  console.log('afterEach', to, from)
})

export default router
