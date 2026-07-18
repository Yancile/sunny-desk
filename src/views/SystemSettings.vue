<template>
  <div class="system-settings" :style="themeStyle">
    <div class="settings-card">
      <div class="card-header">
        <i class="layui-icon layui-icon-theme"></i>
        <span>主题颜色设置</span>
      </div>
      <div class="card-body">
        <div class="theme-presets">
          <div class="preset-grid">
            <div class="preset-item" @click="applyTheme('deepsea')" :class="{ active: currentTheme === 'deepsea' }">
              <div class="preset-preview">
                <div class="preview-main deepsea"></div>
                <div class="preview-accent deepsea-accent"></div>
              </div>
              <span>深海蓝系</span>
            </div>
            <div class="preset-item" @click="applyTheme('teallake')" :class="{ active: currentTheme === 'teallake' }">
              <div class="preset-preview">
                <div class="preview-main teallake"></div>
                <div class="preview-accent teallake-accent"></div>
              </div>
              <span>青蓝湖色</span>
            </div>
            <div class="preset-item" @click="applyTheme('lilac')" :class="{ active: currentTheme === 'lilac' }">
              <div class="preset-preview">
                <div class="preview-main lilac"></div>
                <div class="preview-accent lilac-accent"></div>
              </div>
              <span>灰紫丁香</span>
            </div>
            <div class="preset-item" @click="applyTheme('rosebean')" :class="{ active: currentTheme === 'rosebean' }">
              <div class="preset-preview">
                <div class="preview-main rosebean"></div>
                <div class="preview-accent rosebean-accent"></div>
              </div>
              <span>豆沙玫瑰</span>
            </div>
            <div class="preset-item" @click="applyTheme('brickred')" :class="{ active: currentTheme === 'brickred' }">
              <div class="preset-preview">
                <div class="preview-main brickred"></div>
                <div class="preview-accent brickred-accent"></div>
              </div>
              <span>砖红暖棕</span>
            </div>
            <div class="preset-item" @click="applyTheme('neutralgray')"
              :class="{ active: currentTheme === 'neutralgray' }">
              <div class="preset-preview">
                <div class="preview-main neutralgray"></div>
                <div class="preview-accent neutralgray-accent"></div>
              </div>
              <span>中性灰蓝</span>
            </div>
            <div class="preset-item" @click="applyTheme('olivegreen')"
              :class="{ active: currentTheme === 'olivegreen' }">
              <div class="preset-preview">
                <div class="preview-main olivegreen"></div>
                <div class="preview-accent olivegreen-accent"></div>
              </div>
              <span>橄榄黄绿</span>
            </div>
            <div class="preset-item" @click="applyTheme('warmgold')" :class="{ active: currentTheme === 'warmgold' }">
              <div class="preset-preview">
                <div class="preview-main warmgold"></div>
                <div class="preview-accent warmgold-accent"></div>
              </div>
              <span>暖橙金棕</span>
            </div>
          </div>
        </div>

        <div class="color-sections">
          <div class="color-section">
            <div class="section-header">
              <i class="layui-icon layui-icon-paint"></i>
              <span>主色调</span>
            </div>
            <div class="color-grid">
              <div class="color-item">
                <label>主色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.primary" class="color-picker" />
                  <input type="text" v-model="colors.primary" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>主色浅</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.primaryLight" class="color-picker" />
                  <input type="text" v-model="colors.primaryLight" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>主色深</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.primaryDark" class="color-picker" />
                  <input type="text" v-model="colors.primaryDark" class="layui-input color-text" />
                </div>
              </div>
            </div>
          </div>

          <div class="color-section">
            <div class="section-header">
              <i class="layui-icon layui-icon-menu"></i>
              <span>导航栏颜色</span>
            </div>
            <div class="color-grid">
              <div class="color-item">
                <label>背景色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.sidebarBg" class="color-picker" />
                  <input type="text" v-model="colors.sidebarBg" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>文字颜色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.sidebarText" class="color-picker" />
                  <input type="text" v-model="colors.sidebarText" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>悬停颜色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.sidebarHover" class="color-picker" />
                  <input type="text" v-model="colors.sidebarHover" class="layui-input color-text" />
                </div>
              </div>
            </div>
          </div>

          <div class="color-section">
            <div class="section-header">
              <i class="layui-icon layui-icon-app"></i>
              <span>辅助颜色</span>
            </div>
            <div class="color-grid">
              <div class="color-item">
                <label>成功色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.success" class="color-picker" />
                  <input type="text" v-model="colors.success" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>警告色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.warning" class="color-picker" />
                  <input type="text" v-model="colors.warning" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>危险色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.danger" class="color-picker" />
                  <input type="text" v-model="colors.danger" class="layui-input color-text" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <div class="preview-title">
            <i class="layui-icon layui-icon-eye"></i>
            <span>实时预览</span>
          </div>
          <div class="preview-card" :style="previewStyle">
            <div class="preview-header">
              <div class="preview-logo"></div>
              <span>系统管理</span>
            </div>
            <div class="preview-nav">
              <div class="nav-item active">首页</div>
              <div class="nav-item">个人信息</div>
              <div class="nav-item">用户管理</div>
              <div class="nav-item">系统设置</div>
            </div>
            <div class="preview-footer">
              <button class="preview-btn">退出登录</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="layui-btn save-btn" :style="{ background: colors.primary }" @click="saveSettings">保存设置</button>
        <button class="layui-btn reset-btn" @click="resetSettings">恢复默认</button>
      </div>
    </div>

    <div class="settings-card">
      <div class="card-header">
        <i class="layui-icon layui-icon-cloud"></i>
        <span>云端数据同步</span>
      </div>
      <div class="card-body">
        <div class="sync-section">
          <div v-if="!syncStore.isLoggedIn" class="login-form">
            <div class="form-title">
              <i class="layui-icon layui-icon-user"></i>
              <span>{{ isRegisterMode ? '注册账户' : '登录云端账户' }}</span>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" v-model="loginForm.email" class="layui-input" placeholder="请输入邮箱地址" />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" v-model="loginForm.password" class="layui-input" placeholder="请输入密码" />
            </div>
            <div class="form-actions">
              <button class="sync-btn submit-btn" :disabled="isLoggingIn" @click="handleSubmit">
                <i class="layui-icon"
                  :class="isLoggingIn ? 'layui-icon-loading' : (isRegisterMode ? 'layui-icon-add-circle' : 'layui-icon-login')"></i>
                {{ isLoggingIn ? '处理中...' : (isRegisterMode ? '注册' : '登录') }}
              </button>
              <button class="sync-btn switch-btn" @click="toggleRegisterMode">
                {{ isRegisterMode ? '已有账户？去登录' : '没有账户？去注册' }}
              </button>
            </div>
            <div v-if="loginError" class="login-error">
              <i class="layui-icon layui-icon-warning"></i>
              <span>{{ loginError }}</span>
            </div>
            <div v-if="needsEmailConfirmation" class="email-confirmation">
              <button class="sync-btn resend-btn" @click="handleResendConfirmation">
                <i class="layui-icon layui-icon-mail"></i>
                重新发送验证邮件
              </button>
            </div>
          </div>

          <div v-else class="sync-status">
            <div class="status-icon" :class="{ loggedIn: syncStore.isLoggedIn }">
              <i class="layui-icon" :class="syncStore.isLoggedIn ? 'layui-icon-cloud' : 'layui-icon-cloud-upload'"></i>
            </div>
            <div class="status-info">
              <div class="status-title">{{ syncStore.loginStatus.email || '已登录云端' }}</div>
              <div class="status-desc">{{ syncStore.loginStatus.message }}</div>
            </div>
            <button class="sync-btn logout-btn" @click="handleLogout">
              <i class="layui-icon layui-icon-logout"></i>
              退出登录
            </button>
          </div>

          <div v-if="syncStore.isLoggedIn" class="sync-actions">
            <div v-if="syncStore.hasNewData" class="new-data-notification">
              <i class="layui-icon layui-icon-bell"></i>
              <span>检测到云端有新数据，是否立即同步？</span>
              <button class="sync-now-btn" @click="handleDownload">立即同步</button>
              <button class="dismiss-btn" @click="syncStore.dismissNewData">忽略</button>
            </div>

            <div class="action-row">
              <button class="action-btn upload-btn" :disabled="syncStore.isSyncing" @click="handleUpload">
                <i class="layui-icon layui-icon-upload"></i>
                {{ syncStore.isSyncing ? '同步中...' : '上传数据到云端' }}
              </button>
              <button class="action-btn download-btn" :disabled="syncStore.isSyncing" @click="handleDownload">
                <i class="layui-icon layui-icon-download"></i>
                {{ syncStore.isSyncing ? '同步中...' : '从云端下载数据' }}
              </button>
            </div>

            <div class="auto-sync-switch">
              <span class="switch-label">
                <i class="layui-icon layui-icon-auto"></i>
                <span>自动同步</span>
              </span>
              <div class="switch-wrapper" @click="toggleAutoSync">
                <div class="switch-track" :class="{ enabled: syncStore.autoSyncEnabled }">
                  <div class="switch-thumb"></div>
                </div>
              </div>
              <span class="switch-status">{{ syncStore.autoSyncEnabled ? '开启' : '关闭' }}</span>
            </div>

            <div class="sync-info">
              <div class="info-item">
                <i class="layui-icon layui-icon-clock"></i>
                <span>最后同步时间: {{ syncStore.lastSyncTime || '从未同步' }}</span>
              </div>
              <div class="info-item">
                <i class="layui-icon layui-icon-refresh"></i>
                <span>同步状态: {{ syncStore.getSyncStatusText() }}</span>
              </div>
              <div class="info-item">
                <i class="layui-icon layui-icon-file"></i>
                <span>本地版本: {{ dataManager.getData().syncVersion || 1 }}</span>
              </div>
            </div>

            <div v-if="syncStore.syncError" class="sync-error">
              <i class="layui-icon layui-icon-warning"></i>
              <span>{{ syncStore.syncError }}</span>
              <button class="error-close" @click="syncStore.clearError">
                <i class="layui-icon layui-icon-close"></i>
              </button>
            </div>

            <div class="sync-tips">
              <i class="layui-icon layui-icon-tips"></i>
              <span>提示：登录云端后，开启自动同步可在手机和电脑之间实时共享数据（待办事项、日记、笔记等）。数据将安全存储在云端服务器中。</span>
            </div>

            <div class="sync-tips small">
              <i class="layui-icon layui-icon-info"></i>
              <span>自动同步说明：修改数据后会在3秒内自动上传到云端，其他设备会实时收到数据更新通知。</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-card">
      <div class="card-header">
        <i class="layui-icon layui-icon-file"></i>
        <span>数据备份与恢复</span>
      </div>
      <div class="card-body">
        <div class="backup-section">
          <div class="backup-info">
            <i class="layui-icon layui-icon-database"></i>
            <div class="info-text">
              <div class="info-title">本地数据管理</div>
              <div class="info-desc">您可以导出当前所有数据到本地文件，或从本地文件导入数据进行恢复。</div>
            </div>
          </div>

          <div class="backup-actions">
            <button class="action-btn backup-btn" @click="exportData">
              <i class="layui-icon layui-icon-download"></i>
              导出数据备份
            </button>
            <label class="action-btn restore-btn">
              <i class="layui-icon layui-icon-upload"></i>
              导入数据恢复
              <input type="file" accept=".json" class="file-input" @change="importData" />
            </label>
          </div>

          <div class="backup-format">
            <i class="layui-icon layui-icon-file"></i>
            <span>数据格式: JSON 文件 (.json)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { useSyncStore } from '@/stores/modules/sync'
import { dataManager } from '@/utils/dataManager'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()
const syncStore = useSyncStore()

const currentTheme = ref(appStore.currentTheme)
const isRegisterMode = ref(false)
const isLoggingIn = ref(false)
const loginError = ref('')
const needsEmailConfirmation = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const colors = reactive({
  primary: appStore.primary,
  primaryLight: appStore.primaryLight,
  primaryDark: appStore.primaryDark,
  success: appStore.success,
  warning: appStore.warning,
  danger: appStore.danger,
  sidebarBg: appStore.sidebarBg,
  sidebarText: appStore.sidebarText,
  sidebarHover: appStore.sidebarHover,
})

const settings = reactive({
  systemName: '自我管理系统',
  version: '1.0.0',
  copyright: 'Copyright 2024',
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--success-color': appStore.success,
  '--danger-color': appStore.danger,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
  '--surface-tint': appStore.surfaceTint,
}))

const previewStyle = computed(() => ({
  '--preview-bg': colors.sidebarBg,
  '--preview-text': colors.sidebarText,
  '--preview-hover': colors.sidebarHover,
  '--preview-primary': colors.primary,
  '--preview-gradient': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
}))

const applyTheme = (theme) => {
  currentTheme.value = theme
  appStore.setTheme(theme)
  Object.keys(appStore).forEach(key => {
    if (colors.hasOwnProperty(key)) {
      colors[key] = appStore[key]
    }
  })
}

const saveSettings = () => {
  Object.keys(colors).forEach(key => {
    if (appStore.hasOwnProperty(key)) {
      appStore[key] = colors[key]
    }
  })
  appStore.currentTheme = 'custom'
  layer.msg('设置已保存', { icon: 6 })
}

const resetSettings = () => {
  appStore.resetColors()
  currentTheme.value = appStore.currentTheme
  Object.keys(appStore).forEach(key => {
    if (colors.hasOwnProperty(key)) {
      colors[key] = appStore[key]
    }
  })
  layer.msg('已恢复默认设置', { icon: 6 })
}

const toggleRegisterMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  loginError.value = ''
  needsEmailConfirmation.value = false
}

const handleSubmit = async () => {
  if (!loginForm.email || !loginForm.password) {
    loginError.value = '请填写邮箱和密码'
    return
  }

  isLoggingIn.value = true
  loginError.value = ''
  needsEmailConfirmation.value = false

  try {
    const result = isRegisterMode.value
      ? await syncStore.register(loginForm.email, loginForm.password)
      : await syncStore.login(loginForm.email, loginForm.password)

    if (result.success) {
      layer.msg(result.message || (isRegisterMode.value ? '注册成功' : '登录成功'), { icon: 1 })
      if (!result.needsConfirmation) {
        loginForm.email = ''
        loginForm.password = ''
      } else {
        needsEmailConfirmation.value = true
      }
    } else {
      loginError.value = result.message || (isRegisterMode.value ? '注册失败' : '登录失败')
      if (result.needsConfirmation) {
        needsEmailConfirmation.value = true
      }
    }
  } catch (error) {
    loginError.value = error.message
  } finally {
    isLoggingIn.value = false
  }
}

const handleResendConfirmation = async () => {
  if (!loginForm.email) {
    layer.msg('请输入邮箱地址', { icon: 5 })
    return
  }
  const result = await syncStore.resendConfirmation(loginForm.email)
  if (result.success) {
    layer.msg(result.message, { icon: 1 })
  } else {
    layer.msg(result.message, { icon: 5 })
  }
}

const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await syncStore.logout()
    layer.msg('已退出登录', { icon: 1 })
  }
}

const toggleAutoSync = () => {
  const newState = !syncStore.autoSyncEnabled
  syncStore.enableAutoSync(newState)
  layer.msg(newState ? '自动同步已开启' : '自动同步已关闭', { icon: 1 })
}

const handleUpload = async () => {
  if (confirm('确定要上传当前数据到云端吗？这将覆盖云端中的现有数据。')) {
    const result = await syncStore.uploadData()
    if (result.success) {
      layer.msg(result.message, { icon: 1 })
    } else {
      layer.msg(result.message, { icon: 5 })
    }
  }
}

const handleDownload = async () => {
  if (confirm('确定要从云端下载数据吗？这将覆盖当前本地数据。')) {
    const result = await syncStore.downloadData()
    if (result.success) {
      layer.msg(result.message, { icon: 1 })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      layer.msg(result.message, { icon: 5 })
    }
  }
}

const exportData = () => {
  const dataString = dataManager.exportData()
  const blob = new Blob([dataString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `self-manage-system-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  layer.msg('数据导出成功', { icon: 1 })
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const success = dataManager.importData(e.target.result)
    if (success) {
      layer.msg('数据导入成功，页面将刷新', { icon: 1 })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      layer.msg('数据格式错误，导入失败', { icon: 5 })
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

onMounted(() => {
  syncStore.updateLoginStatus()
})
</script>

<style scoped>
.system-settings {
  padding: 24px;
}

.settings-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: var(--surface-tint, #f8fafc);
  border-bottom: 1px solid var(--surface-tint, #f1f5f9);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.card-header i {
  font-size: 18px;
  color: var(--primary-color, #1e4d7b);
}

.card-body {
  padding: 28px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 20px 24px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
  background: var(--surface-tint, #f8fafc);
}

.theme-presets {
  margin-bottom: 28px;
}

.preset-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 18px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 14px;
}

.preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 14px;
  border: 2px solid var(--surface-tint, #e2e8f0);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.preset-item:hover {
  border-color: var(--text-muted, #cbd5e1);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.preset-item.active {
  border-color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 5%, white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.preset-preview {
  display: flex;
  gap: 6px;
  width: 80px;
  height: 40px;
}

.preview-main {
  flex: 1;
  border-radius: 6px 0 0 6px;
}

.preview-accent {
  width: 24px;
  border-radius: 0 6px 6px 0;
}

.preview-main.deepsea {
  background: #0a1929;
}

.preview-accent.deepsea-accent {
  background: #1e4d7b;
}

.preview-main.teallake {
  background: #064e3b;
}

.preview-accent.teallake-accent {
  background: #0d9488;
}

.preview-main.lilac {
  background: #3b0764;
}

.preview-accent.lilac-accent {
  background: #8b5cf6;
}

.preview-main.rosebean {
  background: #6b2a25;
}

.preview-accent.rosebean-accent {
  background: #d4756a;
}

.preview-main.brickred {
  background: #451a03;
}

.preview-accent.brickred-accent {
  background: #b45309;
}

.preview-main.neutralgray {
  background: #1e293b;
}

.preview-accent.neutralgray-accent {
  background: #64748b;
}

.preview-main.olivegreen {
  background: #1a2e05;
}

.preview-accent.olivegreen-accent {
  background: #65a30d;
}

.preview-main.warmgold {
  background: #431407;
}

.preview-accent.warmgold-accent {
  background: #ea580c;
}

.preset-item span {
  font-size: 13px;
  color: var(--text-muted, #666);
  font-weight: 500;
}

.color-sections {
  margin-bottom: 28px;
}

.color-section {
  margin-bottom: 24px;
}

.color-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--surface-tint, #f1f5f9);
}

.section-header i {
  font-size: 16px;
  color: var(--primary-color, #1e4d7b);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-item label {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  font-weight: 500;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-picker {
  width: 44px;
  height: 38px;
  padding: 2px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-picker:hover {
  border-color: var(--primary-color, #1e4d7b);
}

.color-text {
  flex: 1;
  max-width: 140px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 13px;
  font-family: monospace;
  transition: all 0.2s ease;
}

.color-text:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.preview-section {
  padding-top: 24px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 18px;
}

.preview-title i {
  font-size: 16px;
  color: var(--primary-color, #1e4d7b);
}

.preview-card {
  width: 200px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--preview-gradient, linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.preview-logo {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.preview-nav {
  padding: 8px 0;
}

.nav-item {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--preview-text, #475569);
  cursor: pointer;
  transition: background 0.2s;
}

.nav-item:hover {
  background: var(--preview-hover, #f1f5f9);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-left: 3px solid var(--preview-primary, #1e4d7b);
}

.preview-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-btn {
  width: 100%;
  padding: 10px;
  background: color-mix(in srgb, var(--danger-color, #f87171) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger-color, #f87171) 30%, transparent);
  border-radius: 10px;
  color: var(--danger-color, #f87171);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: color-mix(in srgb, var(--danger-color, #f87171) 25%, transparent);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.form-item label {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.form-item input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-item input:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.form-item input[readonly] {
  background: var(--surface-tint, #fafafa);
  color: var(--text-muted, #999);
}

.save-btn {
  border: none;
  color: #fff;
  height: 38px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.reset-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #d9d9d9);
  color: var(--text-secondary, #333);
  height: 38px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: var(--surface-tint, #f5f5f5);
}

.sync-section {
  padding: 16px 0;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 12px;
  margin-bottom: 20px;
}

.status-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--danger-color, #ef4444) 15%, transparent);
  border-radius: 14px;
  font-size: 24px;
  color: var(--danger-color, #ef4444);
}

.status-icon.loggedIn {
  background: color-mix(in srgb, var(--success-color, #0d9488) 15%, transparent);
  color: var(--success-color, #0d9488);
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #334155);
  margin-bottom: 4px;
}

.status-desc {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #fff;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.logout-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--danger-color, #ef4444);
}

.logout-btn:hover {
  background: color-mix(in srgb, var(--danger-color, #ef4444) 5%, transparent);
}

.sync-actions {
  padding: 16px;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-btn {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  color: #fff;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.download-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
}

.download-btn:hover:not(:disabled) {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.sync-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

.sync-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--danger-color, #ef4444) 10%, transparent);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--danger-color, #ef4444);
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--danger-color, #ef4444);
  cursor: pointer;
  padding: 4px;
}

.sync-tips,
.backup-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--warning-color, #f59e0b) 10%, transparent);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

.sync-tips.small {
  padding: 8px 12px;
  font-size: 12px;
  margin-top: 8px;
}

.new-data-notification {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: color-mix(in srgb, var(--success-color, #0d9488) 15%, transparent);
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text-primary, #334155);
}

.new-data-notification i {
  font-size: 18px;
  color: var(--success-color, #0d9488);
}

.new-data-notification button {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sync-now-btn {
  background: var(--success-color, #0d9488);
  color: #fff;
  border: none;
}

.sync-now-btn:hover {
  opacity: 0.9;
}

.dismiss-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
}

.dismiss-btn:hover {
  border-color: var(--text-muted, #94a3b8);
}

.auto-sync-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 10px;
  margin-bottom: 16px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #475569);
}

.switch-wrapper {
  cursor: pointer;
}

.switch-track {
  width: 52px;
  height: 28px;
  background: #d1d5db;
  border-radius: 14px;
  position: relative;
  transition: background 0.3s;
}

.switch-track.enabled {
  background: var(--primary-color, #1e4d7b);
}

.switch-thumb {
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.switch-track.enabled .switch-thumb {
  transform: translateX(24px);
}

.switch-status {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}

.login-form {
  padding: 20px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 12px;
  margin-bottom: 20px;
}

.form-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #334155);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--surface-tint, #e2e8f0);
}

.form-title i {
  font-size: 18px;
  color: var(--primary-color, #1e4d7b);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #475569);
}

.form-group input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.form-group input::placeholder {
  color: var(--text-muted, #94a3b8);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  color: #fff;
  width: 100%;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
  width: 100%;
  justify-content: center;
  padding: 10px 24px;
}

.switch-btn:hover {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.resend-btn {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border: 1px solid var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
  width: 100%;
  justify-content: center;
  padding: 10px 24px;
}

.resend-btn:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 20%, transparent);
}

.email-confirmation {
  margin-top: 12px;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--danger-color, #ef4444) 10%, transparent);
  border-radius: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--danger-color, #ef4444);
}

.backup-section {
  padding: 16px 0;
}

.backup-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.backup-info i {
  font-size: 28px;
  color: var(--primary-color, #1e4d7b);
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #334155);
  margin-bottom: 4px;
}

.info-desc {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}

.backup-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.backup-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
}

.backup-btn:hover {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.restore-btn {
  background: linear-gradient(135deg, var(--success-color, #0d9488) 0%, color-mix(in srgb, var(--success-color, #0d9488) 70%, white) 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.restore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--success-color, #0d9488) 30%, transparent);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.backup-format {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}
</style>
