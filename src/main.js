import './assets/main.css'
import LayuiVue from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { dataManager } from './utils/dataManager'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(LayuiVue)

app.mount('#app')

const initSync = async () => {
  try {
    const { useSyncStore } = await import('./stores/modules/sync')
    const syncStore = useSyncStore()
    
    dataManager.setOnDataChangedCallback(() => {
      syncStore.handleDataChanged()
    })
    
    await syncStore.checkCloudDataOnStartup()
  } catch (error) {
    console.error('初始化同步功能失败:', error)
  }
}

initSync()