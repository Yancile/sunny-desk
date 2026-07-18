import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { supabaseSync } from '@/utils/supabaseSync'
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
    loginStatus.value = supabaseSync.getLoginStatus()
  }

  const startSync = async (direction = 'upload', showNotification = true) => {
    if (syncing.value) {
      return { success: false, message: '正在同步中' }
    }

    syncing.value = true
    syncStatus.value = 'syncing'
    syncError.value = ''

    try {
      if (!supabaseSync.isLoggedIn()) {
        throw new Error('请先登录')
      }

      if (direction === 'upload') {
        const dataString = dataManager.exportData()
        const result = await supabaseSync.uploadData(dataString)
        if (result.success) {
          lastSyncTime.value = new Date().toLocaleString('zh-CN')
          dataManager.sync.setLastSyncTime(lastSyncTime.value)
          cloudSyncVersion.value = dataManager.getData().syncVersion || 1
          syncStatus.value = 'upload_success'
          return { success: true, message: '数据上传成功' }
        } else {
          throw new Error(result.message)
        }
      } else {
        const result = await supabaseSync.downloadData()
        if (result.success) {
          if (result.data) {
            const success = dataManager.importData(result.data)
            if (success) {
              const data = dataManager.getData()
              lastSyncTime.value = new Date().toLocaleString('zh-CN')
              dataManager.sync.setLastSyncTime(lastSyncTime.value)
              cloudSyncVersion.value = result.syncVersion || data.syncVersion || 1
              syncStatus.value = 'download_success'
              hasNewData.value = false
              if (showNotification) {
                try {
                  layer.msg('数据同步成功', { icon: 1 })
                } catch (e) {}
              }
              return { success: true, message: '数据下载成功' }
            } else {
              throw new Error('数据格式错误')
            }
          } else {
            return { success: true, message: '云端暂无数据' }
          }
        } else {
          throw new Error(result.message)
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
    if (!autoSyncEnabled.value || !supabaseSync.isLoggedIn()) {
      return
    }

    try {
      const localData = dataManager.getData()
      const localVersion = localData.syncVersion || 1
      const localLastModified = localData.lastModifiedTime || 0

      const result = await supabaseSync.checkForUpdates(localVersion, localLastModified)
      if (result.hasUpdate) {
        hasNewData.value = true
        cloudSyncVersion.value = result.cloudVersion
      }
    } catch (error) {
      console.log('检查云端数据失败:', error)
    }
  }

  const handleDataChanged = () => {
    if (!autoSyncEnabled.value || !supabaseSync.isLoggedIn()) {
      return
    }

    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }

    syncTimeout = setTimeout(async () => {
      await startSync('upload', false)
    }, 3000)
  }

  const handleCloudDataChanged = async (payload) => {
    if (!autoSyncEnabled.value) {
      return
    }

    try {
      const localData = dataManager.getData()
      const localVersion = localData.syncVersion || 1

      if (payload.syncVersion > localVersion) {
        const success = dataManager.importData(payload.data)
        if (success) {
          lastSyncTime.value = new Date().toLocaleString('zh-CN')
          dataManager.sync.setLastSyncTime(lastSyncTime.value)
          cloudSyncVersion.value = payload.syncVersion
          hasNewData.value = false
        }
      }
    } catch (error) {
      console.error('处理云端数据变更失败:', error)
    }
  }

  const enableAutoSync = (enabled) => {
    autoSyncEnabled.value = enabled
    if (enabled && supabaseSync.isLoggedIn()) {
      syncIfNeeded()
      startRealtimeSubscription()
    } else {
      stopRealtimeSubscription()
    }
  }

  const checkCloudDataOnStartup = async () => {
    if (!supabaseSync.isLoggedIn()) {
      return
    }

    try {
      const localData = dataManager.getData()
      const localVersion = localData.syncVersion || 1

      const result = await supabaseSync.checkForUpdates(localVersion, 0)
      if (result.hasUpdate) {
        hasNewData.value = true
        cloudSyncVersion.value = result.cloudVersion
      }
    } catch (error) {
      console.log('启动时检查云端数据失败:', error)
    }
  }

  const startRealtimeSubscription = () => {
    if (!supabaseSync.isLoggedIn()) {
      return
    }
    supabaseSync.subscribeToChanges(handleCloudDataChanged)
  }

  const stopRealtimeSubscription = () => {
    supabaseSync.unsubscribeFromChanges()
  }

  const login = async (email, password) => {
    const result = await supabaseSync.signInWithEmail(email, password)
    if (result.success) {
      updateLoginStatus()
      await syncIfNeeded()
      startRealtimeSubscription()
    }
    return result
  }

  const register = async (email, password) => {
    const result = await supabaseSync.signUpWithEmail(email, password)
    if (result.success) {
      updateLoginStatus()
    }
    return result
  }

  const logout = async () => {
    await supabaseSync.signOut()
    loginStatus.value = { loggedIn: false, message: '已退出登录' }
    syncStatus.value = 'idle'
    hasNewData.value = false
    stopRealtimeSubscription()
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
    login,
    register,
    logout,
    clearError,
    dismissNewData,
    getSyncStatusText,
    startRealtimeSubscription,
    stopRealtimeSubscription
  }
}, {
  persist: true
})