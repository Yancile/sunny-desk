<template>
  <div class="not-found-container" :style="themeStyle">
    <div class="not-found-content">
      <div class="error-icon">
        <i class="layui-icon layui-icon-404"></i>
      </div>
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <div class="error-actions">
        <button class="layui-btn layui-btn-normal" @click="goHome">返回首页</button>
        <button class="layui-btn" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'

const router = useRouter()
const appStore = useAppStore()

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color, #1890ff) 0%, var(--primary-light, #40a9ff) 100%);
}

.not-found-content {
  text-align: center;
  background: #fff;
  padding: 60px 80px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.error-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--primary-color, #1890ff) 0%, var(--primary-light, #40a9ff) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon i {
  font-size: 60px;
  color: #fff;
}

.error-code {
  font-size: 72px;
  color: #333;
  margin: 0 0 10px;
  font-weight: bold;
}

.error-message {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>