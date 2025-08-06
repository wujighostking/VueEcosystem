// const pinia = createPinia()
// pinia.use(plugin)
// .use(pinia)
// import { plugin } from './stores/plugins.ts'

import ElementPlus from 'element-plus'
// import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'

createApp(App).use(ElementPlus).mount('#app')
