<template>
  <div class="app-layout">
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }" :style="sidebarStyle">
      <div class="sidebar-logo">
        <i class="layui-icon layui-icon-home"></i>
        <span v-show="!sidebarCollapsed">用户管理系统</span>
      </div>
      <div class="sidebar-user" v-show="!sidebarCollapsed">
        <div class="user-avatar">
          <i class="layui-icon layui-icon-username"></i>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userStore.userInfo.username || '用户' }}</div>
          <div class="user-role">
            {{ userStore.userInfo.role === 'admin' ? '管理员' : userStore.userInfo.role === 'teacher' ? '教师' : '学生' }}
          </div>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li v-for="menu in menuList" :key="menu.path" class="menu-item" :class="{ active: currentPath === menu.path }"
          @click="navigateTo(menu.path)" :data-title="menu.title">
          <i :class="menu.icon" class="menu-icon"></i>
          <span class="menu-text">{{ menu.title }}</span>
        </li>
      </ul>
      <div class="sidebar-footer">
        <button class="logout-btn" @click="showLogoutConfirm = true">
          <i class="layui-icon layui-icon-logout"></i>
          <span v-show="!sidebarCollapsed">退出登录</span>
        </button>
      </div>
      <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed"
        :title="sidebarCollapsed ? '展开菜单' : '收缩菜单'">
        <i class="layui-icon" :class="sidebarCollapsed ? 'layui-icon-spread' : 'layui-icon-shrink'"></i>
      </button>
    </div>

    <div v-if="showLogoutConfirm" class="confirm-modal" @click.self="showLogoutConfirm = false">
      <div class="confirm-dialog">
        <div class="confirm-header">
          <span class="confirm-title">提示</span>
          <button class="confirm-close" @click="showLogoutConfirm = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="confirm-body">
          <i class="layui-icon layui-icon-tips confirm-icon"></i>
          <span>确定要退出登录吗？</span>
        </div>
        <div class="confirm-footer">
          <button class="layui-btn cancel-btn" @click="showLogoutConfirm = false">取消</button>
          <button class="layui-btn confirm-btn" @click="confirmLogout">确定</button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="header-bar">
        <div class="header-left">
          <div class="breadcrumb">
            <span v-for="(item, index) in breadcrumbs" :key="index" class="breadcrumb-item">
              <span v-if="index > 0" class="breadcrumb-separator">
                <i class="layui-icon layui-icon-next"></i>
              </span>
              <span class="breadcrumb-text" :class="{ active: index === breadcrumbs.length - 1 }"
                @click="goToBreadcrumb(item)" v-html="item.text"></span>
            </span>
          </div>
        </div>
      </div>
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const currentPath = computed(() => route.path)
const currentTime = ref('')
const showLogoutConfirm = ref(false)
const sidebarCollapsed = ref(false)

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const currentTitle = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.length > 0 ? matched[matched.length - 1].meta.title : '首页'
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.breadcrumb)
  if (matched.length === 0) return []
  const lastItem = matched[matched.length - 1]
  return [{
    path: lastItem.path,
    text: lastItem.meta.breadcrumb,
    name: lastItem.name
  }]
})

const goToBreadcrumb = (item) => {
  if (item.path && item.path !== route.path) {
    router.push(item.path)
  }
}

const sidebarStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--primary-dark': appStore.primaryDark,
  '--success-color': appStore.success,
  '--warning-color': appStore.warning,
  '--danger-color': appStore.danger,
  '--sidebar-bg-color': appStore.sidebarBg,
  '--sidebar-text-color': appStore.sidebarText,
  '--sidebar-hover-color': appStore.sidebarHover,
  '--sidebar-active-color': appStore.sidebarActive,
  '--logo-gradient': appStore.logoGradient,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
}))

const menuList = computed(() => {
  const baseMenus = [
    { path: '/', title: '首页', icon: 'layui-icon layui-icon-home' },
    { path: '/profile', title: '个人信息', icon: 'layui-icon layui-icon-username' },
    { path: '/system-settings', title: '系统设置', icon: 'layui-icon layui-icon-set' },
  ]
  const adminMenus = [
    { path: '/user-management', title: '用户管理', icon: 'layui-icon layui-icon-user' },
    { path: '/statistics', title: '统计报表', icon: 'layui-icon layui-icon-chart' },
  ]
  const isAdmin = userStore.userInfo.role === 'admin'
  return isAdmin ? [...baseMenus, ...adminMenus] : baseMenus
})

const navigateTo = (path) => {
  router.push(path)
}

const confirmLogout = () => {
  showLogoutConfirm.value = false
  userStore.logout()
  localStorage.clear()
  window.location.href = '/#/login'
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--sidebar-bg-color, #f8fafc);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
  border-right: 1px solid #e2e8f0;
}

.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
  border-radius: 0 16px 16px 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 20px;
  background: var(--logo-gradient, linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%));
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.sidebar-logo i {
  font-size: 24px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px;
  border-bottom: 1px solid var(--sidebar-hover-color, #e2e8f0);
  margin-bottom: 12px;
  background: #fff;
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: var(--logo-gradient, linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #334155);
}

.user-role {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.sidebar-menu {
  list-style: none;
  padding: 0 12px;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  cursor: pointer;
  font-size: 14px;
  color: var(--sidebar-text-color, #475569);
  transition: all 0.25s ease;
  border-radius: 12px;
  margin-bottom: 6px;
  font-weight: 500;
}

.sidebar.collapsed .menu-item {
  padding: 14px 10px;
  justify-content: center;
  border-radius: 10px;
}

.sidebar.collapsed .menu-text {
  display: none;
}

.sidebar.collapsed .menu-item:hover {
  background: var(--sidebar-hover-color, #e2e8f0);
}

.sidebar.collapsed .menu-item.active {
  background: var(--sidebar-active-color, #1e4d7b);
  color: #fff;
}

.menu-item:hover {
  background: var(--sidebar-hover-color, #e2e8f0);
  color: var(--text-primary, #334155);
}

.menu-item.active {
  background: var(--sidebar-active-color, #1e4d7b);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-text {
  flex: 1;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--sidebar-hover-color, #e2e8f0);
  background: #fff;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--danger-color, #f87171) 30%, transparent);
  border-radius: 10px;
  color: var(--danger-color, #f87171);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.logout-btn:hover {
  background: color-mix(in srgb, var(--danger-color, #f87171) 5%, white);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--danger-color, #f87171) 15%, transparent);
}

.sidebar.collapsed .logout-btn {
  padding: 12px;
}

.collapse-btn {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  background: #fff;
  border: 2px solid var(--sidebar-hover-color, #e2e8f0);
  border-radius: 50%;
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.collapse-btn:hover {
  background: var(--primary-color, #1e4d7b);
  border-color: var(--primary-color, #1e4d7b);
  color: #fff;
  transform: translateY(-50%) scale(1.15);
}

.sidebar.collapsed .menu-item {
  position: relative;
}

.sidebar.collapsed .menu-item:hover::after {
  content: attr(data-title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 100;
  margin-left: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #334155);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-separator {
  color: var(--text-muted, #94a3b8);
  margin: 0 6px;
  font-size: 12px;
}

.breadcrumb-text {
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  transition: color 0.2s ease;
}

.breadcrumb-text:hover {
  color: var(--primary-color, #1e4d7b);
}

.breadcrumb-text.active {
  color: var(--primary-color, #1e4d7b);
  font-weight: 500;
}

.header-right {
  font-size: 14px;
  color: #64748b;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: #fff;
  border-radius: 16px;
  width: 380px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  animation: dialogFadeIn 0.3s ease;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.confirm-title {
  font-size: 17px;
  font-weight: 600;
  color: #334155;
}

.confirm-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.2s ease;
}

.confirm-close:hover {
  color: #64748b;
  background: #f1f5f9;
}

.confirm-body {
  padding: 36px 24px;
  text-align: center;
  font-size: 15px;
  color: #475569;
}

.confirm-icon {
  font-size: 36px;
  color: #fbbf24;
  margin-right: 12px;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.cancel-btn {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.confirm-btn {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  color: #fff;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}
</style>