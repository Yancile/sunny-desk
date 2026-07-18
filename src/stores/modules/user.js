import { defineStore } from 'pinia'
import { dataManager } from '@/utils/dataManager'
import { supabaseSync } from '@/utils/supabaseSync'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {},
    role: '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.role === 'admin',
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      this.role = userInfo.role || 'user'
    },
    async login(username, password) {
      try {
        const user = dataManager.users.validateLogin(username, password)
        if (user) {
          dataManager.setCurrentUserId(user.id)
          dataManager.loadData()
          this.setToken(`local-${user.id}-${Date.now()}`)
          this.setUserInfo({
            id: user.id,
            username: user.username,
            role: user.role,
            status: user.status
          })

          await supabaseSync.initializeAuth()

          const { useSyncStore } = await import('./sync')
          const syncStore = useSyncStore()
          syncStore.updateLoginStatus()
          
          if (supabaseSync.isLoggedIn()) {
            await syncStore.handlePostLoginSync()
          } else {
            syncStore.checkCloudDataOnStartup()
          }

          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    async register(username, password) {
      try {
        const result = dataManager.users.register(username, password)
        if (result.success) {
          return { success: true, message: result.message }
        }
        return { success: false, message: result.message }
      } catch (error) {
        console.error('注册失败:', error)
        return { success: false, message: '注册失败，请稍后重试' }
      }
    },
    logout() {
      dataManager.setCurrentUserId(null)
      this.token = ''
      this.userInfo = {}
      this.role = ''
      localStorage.removeItem('self_manage_system_current_user_id')
      window.location.href = '/#/login'
    },
  },
  persist: true,
})