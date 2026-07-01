import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/user'

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
        const res = await loginApi({ username, password })
        this.setToken(res.data.token)
        this.setUserInfo(res.data.userInfo)
        return true
      } catch (error) {
        return false
      }
    },
    logout() {
      this.token = ''
      this.userInfo = {}
      this.role = ''
    },
  },
  persist: true,
})