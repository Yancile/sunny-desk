<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-left">
        <div class="left-content">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="layui-icon layui-icon-set"></i>
            </div>
            <h1 class="system-title">用户后台管理系统</h1>
            <p class="system-subtitle">高效管理 · 便捷操作 · 安全稳定</p>
          </div>
          <ul class="feature-list">
            <li class="feature-item">
              <i class="layui-icon layui-icon-ok-circle"></i>
              <span>账号权限分级管理</span>
            </li>
            <li class="feature-item">
              <i class="layui-icon layui-icon-ok-circle"></i>
              <span>业务数据可视化统计</span>
            </li>
            <li class="feature-item">
              <i class="layui-icon layui-icon-ok-circle"></i>
              <span>系统功能配置维护</span>
            </li>
            <li class="feature-item">
              <i class="layui-icon layui-icon-ok-circle"></i>
              <span>操作日志全程追溯</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="login-right">
        <div class="right-content">
          <div class="login-header">
            <h2 class="login-title">欢迎登录</h2>
            <p class="login-subtitle">请输入您的账号信息</p>
          </div>
          <form class="login-form">
            <div class="form-item">
              <div class="input-wrapper">
                <i class="layui-icon layui-icon-username input-icon"></i>
                <input type="text" v-model="form.username" placeholder="请输入账号" class="login-input" />
              </div>
            </div>
            <div class="form-item">
              <div class="input-wrapper">
                <i class="layui-icon layui-icon-password input-icon"></i>
                <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="请输入密码"
                  class="login-input" />
                <i class="layui-icon password-toggle" :class="showPassword ? 'layui-icon-eye' : 'layui-icon-eye-off'"
                  @click="showPassword = !showPassword"></i>
              </div>
            </div>
            <button type="button" class="login-btn" :class="{ 'login-btn-loading': loading }" @click="handleLogin">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { layer } from '@layui/layui-vue'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const showPassword = ref(false)

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})

const handleLogin = async () => {
  if (!form.username) {
    layer.msg('请输入用户名', { icon: 5 })
    return
  }
  if (!form.password) {
    layer.msg('请输入密码', { icon: 5 })
    return
  }

  loading.value = true
  try {
    const success = await userStore.login(form.username, form.password)
    if (success) {
      layer.msg('登录成功', { icon: 6 })
      router.push('/')
    } else {
      layer.msg('用户名或密码错误', { icon: 5 })
    }
  } catch (error) {
    layer.msg('登录失败，请稍后重试', { icon: 5 })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--surface-tint, #f1f5f9) 0%, var(--surface-tint, #e2e8f0) 100%);
  padding: 20px;
}

.login-container {
  display: flex;
  width: 900px;
  max-width: 100%;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-content {
  color: #fff;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 88px;
  height: 88px;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  font-size: 36px;
  position: relative;
  backdrop-filter: blur(8px);
}

.logo-icon .layui-icon:first-child {
  position: relative;
  z-index: 2;
}

.logo-icon .layui-icon:last-child {
  position: absolute;
  font-size: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.system-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 10px;
}

.system-subtitle {
  font-size: 14px;
  opacity: 0.85;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  font-size: 15px;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.feature-item:hover {
  opacity: 1;
}

.feature-item .layui-icon {
  font-size: 18px;
}

.login-right {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-content {
  width: 100%;
  max-width: 320px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary, #334155);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 16px;
  color: var(--text-muted, #94a3b8);
  z-index: 1;
}

.login-input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 48px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 14px;
  font-size: 15px;
  color: var(--text-primary, #334155);
  transition: all 0.3s ease;
  outline: none;
  background: var(--surface-tint, #f8fafc);
}

.login-input:focus {
  border-color: var(--primary-color, #1e4d7b);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
  background: #fff;
}

.login-input::placeholder {
  color: var(--text-muted, #94a3b8);
}

.password-toggle {
  position: absolute;
  right: 16px;
  font-size: 16px;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  z-index: 1;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--primary-color, #1e4d7b);
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn-loading {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    border-radius: 20px;
  }

  .login-left {
    padding: 40px 30px;
  }

  .login-right {
    padding: 40px 30px;
  }

  .system-title {
    font-size: 22px;
  }

  .feature-item {
    font-size: 13px;
  }

  .logo-icon {
    width: 72px;
    height: 72px;
    font-size: 28px;
  }
}
</style>