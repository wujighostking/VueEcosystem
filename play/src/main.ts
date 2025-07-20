import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { plugin } from './stores/plugins.ts'

const pinia = createPinia()
pinia.use(plugin)

createApp(App).use(pinia).mount('#app')
