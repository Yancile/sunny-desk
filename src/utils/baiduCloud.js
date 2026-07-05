const CLIENT_ID = '123903845'
const CLIENT_SECRET = 'L4MQdXUZyI7tr3zHNc5ARTPDJuhwdnFx'
const REDIRECT_URI = window.location.origin + window.location.pathname + '#/system-settings'
const AUTH_URL = 'https://openapi.baidu.com/oauth/2.0/authorize'
const TOKEN_URL = 'https://openapi.baidu.com/oauth/2.0/token'
const API_BASE_URL = 'https://pan.baidu.com/rest/2.0/xpan'

const STORAGE_KEY = 'baidu_cloud_tokens'

const getTokens = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('获取令牌失败:', error)
  }
  return null
}

const saveTokens = (tokens) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  } catch (error) {
    console.error('保存令牌失败:', error)
  }
}

const clearTokens = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'basic,netdisk',
    display: 'popup'
  })
  return `${AUTH_URL}?${params.toString()}`
}

const exchangeCodeForToken = async (code) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const data = await response.json()

    if (data.access_token) {
      const tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        expiresAt: Date.now() + data.expires_in * 1000
      }
      saveTokens(tokens)
      return tokens
    }

    throw new Error(data.error_description || '获取令牌失败')
  } catch (error) {
    console.error('兑换令牌失败:', error)
    throw error
  }
}

const refreshAccessToken = async () => {
  const tokens = getTokens()
  if (!tokens || !tokens.refreshToken) {
    throw new Error('没有刷新令牌')
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const data = await response.json()

    if (data.access_token) {
      const newTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || tokens.refreshToken,
        expiresIn: data.expires_in,
        expiresAt: Date.now() + data.expires_in * 1000
      }
      saveTokens(newTokens)
      return newTokens
    }

    throw new Error(data.error_description || '刷新令牌失败')
  } catch (error) {
    console.error('刷新令牌失败:', error)
    clearTokens()
    throw error
  }
}

const getValidAccessToken = async () => {
  const tokens = getTokens()

  if (!tokens) {
    throw new Error('未登录百度网盘')
  }

  if (Date.now() >= tokens.expiresAt) {
    const newTokens = await refreshAccessToken()
    return newTokens.accessToken
  }

  return tokens.accessToken
}

const request = async (url, options = {}) => {
  const accessToken = await getValidAccessToken()

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }

  const mergedOptions = { ...defaultOptions, ...options }

  const response = await fetch(url, mergedOptions)
  const data = await response.json()

  if (data.error_code) {
    throw new Error(data.error_msg || '请求失败')
  }

  return data
}

const uploadFile = async (file, path) => {
  try {
    const accessToken = await getValidAccessToken()

    const uploadUrl = `${API_BASE_URL}/file?method=upload&access_token=${accessToken}`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    formData.append('isdir', '0')

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.error_code) {
      throw new Error(data.error_msg || '上传失败')
    }

    return data
  } catch (error) {
    console.error('上传文件失败:', error)
    throw error
  }
}

const downloadFile = async (path) => {
  try {
    const accessToken = await getValidAccessToken()

    const downloadUrl = `${API_BASE_URL}/file?method=download&access_token=${accessToken}&path=${encodeURIComponent(path)}`

    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error('下载失败')
    }

    return await response.text()
  } catch (error) {
    console.error('下载文件失败:', error)
    throw error
  }
}

const listFiles = async (path = '/', limit = 100) => {
  try {
    const accessToken = await getValidAccessToken()

    const listUrl = `${API_BASE_URL}/file?method=list&access_token=${accessToken}&path=${encodeURIComponent(path)}&limit=${limit}`

    const response = await fetch(listUrl)
    const data = await response.json()

    if (data.error_code) {
      throw new Error(data.error_msg || '获取文件列表失败')
    }

    return data
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

const createDirectory = async (path) => {
  try {
    const accessToken = await getValidAccessToken()

    const createUrl = `${API_BASE_URL}/file?method=mkdir&access_token=${accessToken}&path=${encodeURIComponent(path)}&isdir=1`

    const response = await fetch(createUrl, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.error_code && data.error_code !== 11) {
      throw new Error(data.error_msg || '创建目录失败')
    }

    return data
  } catch (error) {
    console.error('创建目录失败:', error)
    throw error
  }
}

const deleteFile = async (path) => {
  try {
    const accessToken = await getValidAccessToken()

    const deleteUrl = `${API_BASE_URL}/file?method=delete&access_token=${accessToken}&path=${encodeURIComponent(path)}`

    const response = await fetch(deleteUrl, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.error_code) {
      throw new Error(data.error_msg || '删除文件失败')
    }

    return data
  } catch (error) {
    console.error('删除文件失败:', error)
    throw error
  }
}

const syncDataToCloud = async (dataString) => {
  try {
    await createDirectory('/self-manage-system')

    const blob = new Blob([dataString], { type: 'application/json' })
    const file = new File([blob], 'data-backup.json', { type: 'application/json' })

    const result = await uploadFile(file, '/self-manage-system/data-backup.json')

    return result
  } catch (error) {
    console.error('同步数据到云端失败:', error)
    throw error
  }
}

const syncDataFromCloud = async () => {
  try {
    const data = await downloadFile('/self-manage-system/data-backup.json')
    return data
  } catch (error) {
    console.error('从云端同步数据失败:', error)
    throw error
  }
}

const isLoggedIn = () => {
  const tokens = getTokens()
  return tokens && tokens.accessToken && Date.now() < tokens.expiresAt
}

const getLoginStatus = () => {
  if (!isLoggedIn()) {
    return { loggedIn: false, message: '未登录' }
  }

  const tokens = getTokens()
  const remainingTime = Math.floor((tokens.expiresAt - Date.now()) / (1000 * 60))

  return {
    loggedIn: true,
    message: remainingTime > 0 ? `已登录，剩余 ${remainingTime} 分钟` : '登录已过期'
  }
}

export const baiduCloud = {
  CLIENT_ID,
  CLIENT_SECRET,
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getValidAccessToken,
  uploadFile,
  downloadFile,
  listFiles,
  createDirectory,
  deleteFile,
  syncDataToCloud,
  syncDataFromCloud,
  isLoggedIn,
  getLoginStatus,
  clearTokens,
  getTokens
}