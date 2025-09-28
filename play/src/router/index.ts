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

      beforeEnter() {
        // eslint-disable-next-line no-console
        console.log('beforeEnter')
      },
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
})

router.beforeEach(() => {
  // eslint-disable-next-line no-console
  console.log('beforeEach')
})

router.beforeResolve(() => {
  // eslint-disable-next-line no-console
  console.log('beforeResolve')
})

router.afterEach(() => {
  // eslint-disable-next-line no-console
  console.log('afterEach')
})

export default router
