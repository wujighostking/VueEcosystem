import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),

      children: [
        {
          path: 'a',
          name: 'a',
          component: () => import('@/views/home/A.vue'),
        },
        {
          path: 'b',
          name: 'b',
          component: () => import('@/views/home/B.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/about/index.vue'),
    },
  ],
})

export default router
