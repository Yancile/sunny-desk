import './assets/main.css'
import LayuiVue from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { dataManager } from './utils/dataManager'
import { supabaseSync } from './utils/supabaseSync'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(LayuiVue)

app.mount('#app')

const initSync = async () => {
  try {
    await supabaseSync.initializeAuth()

    const { useSyncStore } = await import('./stores/modules/sync')
    const syncStore = useSyncStore()

    dataManager.setOnDataChangedCallback(() => {
      syncStore.handleDataChanged()
    })

    supabaseSync.handleAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        syncStore.updateLoginStatus()
        syncStore.checkCloudDataOnStartup()
        syncStore.startRealtimeSubscription()
      } else if (event === 'SIGNED_OUT') {
        syncStore.updateLoginStatus()
        syncStore.stopRealtimeSubscription()
      }
    })

    await syncStore.checkCloudDataOnStartup()
  } catch (error) {
    console.error('初始化同步功能失败:', error)
  }
}

initSync()