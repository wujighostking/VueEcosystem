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
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
})

export default router
