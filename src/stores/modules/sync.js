import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { baiduCloud } from '@/utils/baiduCloud'
import { dataManager } from '@/utils/dataManager'

export const useSyncStore = defineStore('sync', () => {
  const syncing = ref(false)
  const lastSyncTime = ref(null)
  const syncStatus = ref('idle')
  const loginStatus = ref({ loggedIn: false, message: '未登录' })
  const syncError = ref('')
  const autoSyncEnabled = ref(true)
  const cloudSyncVersion = ref(0)
  const hasNewData = ref(false)
  let syncTimeout = null

  const isSyncing = computed(() => syncing.value)
  const isLoggedIn = computed(() => loginStatus.value.loggedIn)

  const updateLoginStatus = () => {
    loginStatus.value = baiduCloud.getLoginStatus()
  }

  const startSync = async (direction = 'upload', showNotification = true) => {
    if (syncing.value) {
      return { success: false, message: '正在同步中' }
    }

    syncing.value = true
    syncStatus.value = 'syncing'
    syncError.value = ''

    try {
      if (!baiduCloud.isLoggedIn()) {
        throw new Error('请先登录百度网盘')
      }

      if (direction === 'upload') {
        const dataString = dataManager.exportData()
        await baiduCloud.syncDataToCloud(dataString)
        lastSyncTime.value = new Date().toLocaleString('zh-CN')
        dataManager.sync.setLastSyncTime(lastSyncTime.value)
        cloudSyncVersion.value = dataManager.getData().syncVersion || 1
        syncStatus.value = 'upload_success'
        return { success: true, message: '数据上传成功' }
      } else {
        const dataString = await baiduCloud.syncDataFromCloud()
        const success = dataManager.importData(dataString)
        if (success) {
          const data = dataManager.getData()
          lastSyncTime.value = new Date().toLocaleString('zh-CN')
          dataManager.sync.setLastSyncTime(lastSyncTime.value)
          cloudSyncVersion.value = data.syncVersion || 1
          syncStatus.value = 'download_success'
          hasNewData.value = false
          if (showNotification) {
            try {
              layer.msg('数据同步成功', { icon: 1 })
            } catch (e) { }
          }
          return { success: true, message: '数据下载成功' }
        } else {
          throw new Error('数据格式错误')
        }
      }
    } catch (error) {
      console.error('同步失败:', error)
      syncError.value = error.message
      syncStatus.value = 'error'
      return { success: false, message: error.message }
    } finally {
      syncing.value = false
      setTimeout(() => {
        if (syncStatus.value !== 'error') {
          syncStatus.value = 'idle'
        }
      }, 3000)
    }
  }

  const uploadData = async () => {
    return await startSync('upload', true)
  }

  const downloadData = async () => {
    return await startSync('download', true)
  }

  const syncIfNeeded = async () => {
    if (!autoSyncEnabled.value || !baiduCloud.isLoggedIn()) {
      return
    }

    try {
      const localData = dataManager.getData()
      const localVersion = localData.syncVersion || 1
      const localLastModified = localData.lastModifiedTime || 0
      const localLastSync = localData.lastSyncTime

      if (!localLastSync) {
        return
      }

      const cloudDataString = await baiduCloud.syncDataFromCloud()
      const cloudData = JSON.parse(cloudDataString)
      const cloudVersion = cloudData.syncVersion || 0
      const cloudLastModified = cloudData.lastModifiedTime || 0

      if (cloudVersion > localVersion || cloudLastModified > localLastModified) {
        hasNewData.value = true
      }
    } catch (error) {
      console.log('检查云端数据失败:', error)
    }
  }

  const handleDataChanged = () => {
    if (!autoSyncEnabled.value || !baiduCloud.isLoggedIn()) {
      return
    }

    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }

    syncTimeout = setTimeout(async () => {
      await startSync('upload', false)
    }, 5000)
  }

  const enableAutoSync = (enabled) => {
    autoSyncEnabled.value = enabled
    if (enabled && baiduCloud.isLoggedIn()) {
      syncIfNeeded()
    }
  }

  const checkCloudDataOnStartup = async () => {
    if (!baiduCloud.isLoggedIn()) {
      return
    }

    try {
      const localData = dataManager.getData()
      const localVersion = localData.syncVersion || 1
      const cloudDataString = await baiduCloud.syncDataFromCloud()
      const cloudData = JSON.parse(cloudDataString)
      const cloudVersion = cloudData.syncVersion || 0

      if (cloudVersion > localVersion) {
        hasNewData.value = true
      }
    } catch (error) {
      console.log('启动时检查云端数据失败:', error)
    }
  }

  const handleOAuthCallback = async (code) => {
    try {
      await baiduCloud.exchangeCodeForToken(code)
      updateLoginStatus()
      await syncIfNeeded()
      return { success: true, message: '登录成功' }
    } catch (error) {
      console.error('OAuth回调处理失败:', error)
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    baiduCloud.clearTokens()
    loginStatus.value = { loggedIn: false, message: '已退出登录' }
    syncStatus.value = 'idle'
    hasNewData.value = false
    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }
  }

  const clearError = () => {
    syncError.value = ''
    syncStatus.value = 'idle'
  }

  const dismissNewData = () => {
    hasNewData.value = false
  }

  const getSyncStatusText = () => {
    switch (syncStatus.value) {
      case 'idle':
        return '空闲'
      case 'syncing':
        return '同步中...'
      case 'upload_success':
        return '上传成功'
      case 'download_success':
        return '下载成功'
      case 'error':
        return '同步失败'
      default:
        return '未知'
    }
  }

  updateLoginStatus()

  return {
    syncing,
    lastSyncTime,
    syncStatus,
    loginStatus,
    syncError,
    autoSyncEnabled,
    cloudSyncVersion,
    hasNewData,
    isSyncing,
    isLoggedIn,
    updateLoginStatus,
    startSync,
    uploadData,
    downloadData,
    syncIfNeeded,
    handleDataChanged,
    enableAutoSync,
    checkCloudDataOnStartup,
    handleOAuthCallback,
    logout,
    clearError,
    dismissNewData,
    getSyncStatusText
  }
}, {
  persist: true
})