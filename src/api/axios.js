import axios from 'axios'
import { useUserStore } from '../stores/modules/user'
import { layer } from '@layui/layui-vue'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      layer.msg(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const userStore = useUserStore()
        userStore.logout()
        layer.msg('登录已过期，请重新登录', () => {
          window.location.href = '/#/login'
        })
      } else {
        layer.msg(error.response.data?.message || '请求失败')
      }
    } else {
      layer.msg('网络错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default service
