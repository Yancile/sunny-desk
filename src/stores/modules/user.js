import { defineStore } from 'pinia'
import { dataManager } from '@/utils/dataManager'

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
          this.setToken(`local-${user.id}-${Date.now()}`)
          this.setUserInfo({
            id: user.id,
            username: user.username,
            role: user.role,
            status: user.status
          })
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    logout() {
      this.token = ''
      this.userInfo = {}
      this.role = ''
      localStorage.clear()
      window.location.href = '/#/login'
    },
  },
  persist: true,
})