import { supabase } from './supabase'

const STORAGE_KEY = 'supabase_user_session'

const saveSession = (session) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('保存会话失败:', error)
  }
}

const getSavedSession = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('获取会话失败:', error)
  }
  return null
}

const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (data.session) {
      saveSession(data.session)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('登录失败:', error)
    return { success: false, message: error.message }
  }
}

const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (data.session) {
      saveSession(data.session)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('注册失败:', error)
    return { success: false, message: error.message }
  }
}

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    clearSession()
    return { success: true }
  } catch (error) {
    console.error('退出失败:', error)
    return { success: false, message: error.message }
  }
}

const getCurrentUser = () => {
  const { data: { user } } = supabase.auth.getUser()
  return user
}

const isLoggedIn = () => {
  const { data: { session } } = supabase.auth.getSession()
  return !!session
}

const getLoginStatus = () => {
  const { data: { session } } = supabase.auth.getSession()
  if (!session) {
    return { loggedIn: false, message: '未登录' }
  }
  
  const expiresAt = session.expires_at * 1000
  const remainingTime = Math.floor((expiresAt - Date.now()) / (1000 * 60))
  
  return {
    loggedIn: true,
    message: remainingTime > 0 ? `已登录，剩余 ${remainingTime} 分钟` : '登录已过期',
    email: session.user.email
  }
}

const uploadData = async (dataString) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }
    
    const data = JSON.parse(dataString)
    const syncVersion = data.syncVersion || 1
    const lastModified = data.lastModifiedTime || Date.now()
    
    const { error } = await supabase
      .from('app_data')
      .upsert({
        user_id: user.id,
        data: data,
        sync_version: syncVersion,
        last_modified: new Date(lastModified).toISOString()
      })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return { success: true }
  } catch (error) {
    console.error('上传数据失败:', error)
    return { success: false, message: error.message }
  }
}

const downloadData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }
    
    const { data, error } = await supabase
      .from('app_data')
      .select('data, sync_version, last_modified')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: null, message: '云端暂无数据' }
      }
      throw new Error(error.message)
    }
    
    return {
      success: true,
      data: JSON.stringify(data.data),
      syncVersion: data.sync_version,
      lastModified: data.last_modified
    }
  } catch (error) {
    console.error('下载数据失败:', error)
    return { success: false, message: error.message }
  }
}

const checkForUpdates = async (localVersion, localLastModified) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { hasUpdate: false }
    }
    
    const { data, error } = await supabase
      .from('app_data')
      .select('sync_version, last_modified')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { hasUpdate: false }
      }
      throw new Error(error.message)
    }
    
    const cloudVersion = data.sync_version || 0
    const cloudLastModified = new Date(data.last_modified).getTime()
    
    const hasUpdate = cloudVersion > localVersion || cloudLastModified > localLastModified
    
    return {
      hasUpdate,
      cloudVersion,
      cloudLastModified
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    return { hasUpdate: false }
  }
}

let realtimeChannel = null
let onDataChangedCallback = null

const subscribeToChanges = (callback) => {
  onDataChangedCallback = callback
  
  if (realtimeChannel) {
    realtimeChannel.unsubscribe()
  }
  
  realtimeChannel = supabase
    .channel('app_data_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_data'
      },
      async (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const cloudData = payload.new
          if (cloudData && cloudData.data && onDataChangedCallback) {
            onDataChangedCallback({
              data: JSON.stringify(cloudData.data),
              syncVersion: cloudData.sync_version,
              lastModified: cloudData.last_modified
            })
          }
        }
      }
    )
    .subscribe()
  
  return realtimeChannel
}

const unsubscribeFromChanges = () => {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe()
    realtimeChannel = null
  }
  onDataChangedCallback = null
}

const handleAuthStateChange = (callback) => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      saveSession(session)
    } else if (event === 'SIGNED_OUT') {
      clearSession()
    }
    callback(event, session)
  })
}

const initializeAuth = async () => {
  const savedSession = getSavedSession()
  if (savedSession) {
    try {
      await supabase.auth.setSession(savedSession)
    } catch (error) {
      console.error('恢复会话失败:', error)
      clearSession()
    }
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    saveSession(session)
  }
}

export const supabaseSync = {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  isLoggedIn,
  getLoginStatus,
  uploadData,
  downloadData,
  checkForUpdates,
  subscribeToChanges,
  unsubscribeFromChanges,
  handleAuthStateChange,
  initializeAuth
}