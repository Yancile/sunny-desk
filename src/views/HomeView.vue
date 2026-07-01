<template>
  <div class="home-page" :style="themeStyle">
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-icon">
          <i class="layui-icon layui-icon-face-smile"></i>
        </div>
        <div class="welcome-content">
          <div class="welcome-title">欢迎，{{ userStore.userInfo.username || '用户' }}！</div>
          <div class="welcome-desc">今天是 {{ currentDate }}，祝您工作愉快</div>
        </div>
        <div class="welcome-time">{{ currentTime }}</div>
      </div>
    </div>

    <div class="weather-section">
      <div class="weather-card">
        <div class="weather-icon-wrap">
          <i class="layui-icon layui-icon-cloud"></i>
        </div>
        <div class="weather-main">
          <span class="weather-city">{{ weather.city || '未知城市' }}</span>
          <span class="weather-temp">{{ weather.temp || '--' }}°C</span>
          <span class="weather-desc">{{ weather.description || '暂无数据' }}</span>
        </div>
        <div class="weather-details">
          <div class="weather-detail">
            <span class="detail-label">最高</span>
            <span class="detail-value">{{ weather.maxTemp || '--' }}°</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">最低</span>
            <span class="detail-value">{{ weather.minTemp || '--' }}°</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">湿度</span>
            <span class="detail-value">{{ weather.humidity || '--' }}%</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">风速</span>
            <span class="detail-value">{{ weather.wind || '--' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon todo">
            <i class="layui-icon layui-icon-list"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayTodoCount }}</div>
            <div class="stat-label">今日待办</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="layui-icon layui-icon-check"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayCompletedCount }}</div>
            <div class="stat-label">今日完成</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon overdue">
            <i class="layui-icon layui-icon-alarm"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overdueCount }}</div>
            <div class="stat-label">逾期任务</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon schedule">
            <i class="layui-icon layui-icon-calendar"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ todayScheduleCount }}</div>
            <div class="stat-label">今日日程</div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-row">
      <div class="left-panel">
        <div class="completion-chart-card">
          <div class="card-header">
            <span class="card-title">任务完成率</span>
            <span class="card-subtitle">今日/本周</span>
          </div>
          <div class="chart-container">
            <div class="chart-ring">
              <svg viewBox="0 0 100 100" class="ring-svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="8" />
                <circle cx="50" cy="50" r="40" fill="none" :stroke="appStore.primary" stroke-width="8"
                  :stroke-dasharray="251.2" :stroke-dashoffset="251.2 * (1 - todayCompletionRate)"
                  stroke-linecap="round" class="progress-ring" />
              </svg>
              <div class="ring-center">
                <div class="ring-value">{{ Math.round(todayCompletionRate * 100) }}%</div>
                <div class="ring-label">今日</div>
              </div>
            </div>
            <div class="chart-ring">
              <svg viewBox="0 0 100 100" class="ring-svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="8" />
                <circle cx="50" cy="50" r="40" fill="none" :stroke="appStore.success" stroke-width="8"
                  :stroke-dasharray="251.2" :stroke-dashoffset="251.2 * (1 - weekCompletionRate)" stroke-linecap="round"
                  class="progress-ring" />
              </svg>
              <div class="ring-center">
                <div class="ring-value">{{ Math.round(weekCompletionRate * 100) }}%</div>
                <div class="ring-label">本周</div>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions-card">
          <div class="card-header">
            <span class="card-title">快捷操作</span>
          </div>
          <div class="quick-actions-grid">
            <div class="action-item" @click="goTo('/todo')">
              <div class="action-icon">
                <i class="layui-icon layui-icon-list"></i>
              </div>
              <span class="action-text">添加待办</span>
            </div>
            <div class="action-item" @click="goTo('/memo')">
              <div class="action-icon">
                <i class="layui-icon layui-icon-note"></i>
              </div>
              <span class="action-text">写备忘录</span>
            </div>
            <div class="action-item" @click="goTo('/pomodoro')">
              <div class="action-icon">
                <i class="layui-icon layui-icon-timer"></i>
              </div>
              <span class="action-text">番茄钟</span>
            </div>
            <div class="action-item" @click="goTo('/schedule')">
              <div class="action-icon">
                <i class="layui-icon layui-icon-calendar"></i>
              </div>
              <span class="action-text">添加日程</span>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="todo-preview-card">
          <div class="card-header">
            <span class="card-title">今日待办</span>
            <button class="card-more" @click="goTo('/todo')">查看全部</button>
          </div>
          <div class="todo-list">
            <div v-if="todayTodos.length === 0" class="empty-state">
              <i class="layui-icon layui-icon-list"></i>
              <span>暂无待办任务</span>
            </div>
            <div v-for="todo in todayTodos" :key="todo.id" class="todo-item"
              :class="{ completed: todo.status === 'completed' }">
              <input type="checkbox" :checked="todo.status === 'completed'" @change="toggleTodo(todo.id)"
                class="todo-checkbox" />
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-meta">
                  <span class="priority-tag" :class="todo.priority">{{ getPriorityText(todo.priority) }}</span>
                  <span class="deadline">{{ formatTime(todo.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="schedule-preview-card">
          <div class="card-header">
            <span class="card-title">今日日程</span>
            <button class="card-more" @click="goTo('/schedule')">查看全部</button>
          </div>
          <div class="schedule-list">
            <div v-if="todaySchedules.length === 0" class="empty-state">
              <i class="layui-icon layui-icon-calendar"></i>
              <span>暂无日程安排</span>
            </div>
            <div v-for="schedule in todaySchedules" :key="schedule.id" class="schedule-item">
              <div class="schedule-time">
                <span class="time">{{ formatScheduleTime(schedule.time) }}</span>
              </div>
              <div class="schedule-content">
                <div class="schedule-title">{{ schedule.title }}</div>
                <div class="schedule-meta">
                  <span class="location">{{ schedule.location }}</span>
                  <span class="color-dot" :style="{ background: schedule.color }"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAdmin" class="admin-section">
      <div class="section-title">用户统计</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">
            <i class="layui-icon layui-icon-group"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ adminCount }}</div>
            <div class="stat-label">管理员</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ studentCount }}</div>
            <div class="stat-label">学生用户</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ teacherCount }}</div>
            <div class="stat-label">教师用户</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { getStatistics } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const totalUsers = ref(0)
const adminCount = ref(0)
const studentCount = ref(0)
const teacherCount = ref(0)
const weather = ref({
  temp: '',
  maxTemp: '',
  minTemp: '',
  description: '',
  city: '北京',
  humidity: '',
  wind: ''
})

const currentTime = ref('')
const todayTodoCount = ref(3)
const todayCompletedCount = ref(1)
const overdueCount = ref(0)
const todayScheduleCount = ref(2)
const todayCompletionRate = computed(() => {
  const total = todayTodoCount.value + todayCompletedCount.value
  return total > 0 ? todayCompletedCount.value / total : 0
})
const weekCompletionRate = ref(0.65)

const todayTodos = ref([
  { id: 1, title: '完成项目文档编写', priority: 'high', deadline: '14:00', status: 'pending' },
  { id: 2, title: '代码审查', priority: 'medium', deadline: '16:00', status: 'pending' },
  { id: 3, title: '团队周会', priority: 'low', deadline: '10:00', status: 'completed' },
])

const todaySchedules = ref([
  { id: 1, title: '产品需求评审', time: '09:30', location: '会议室A', color: '#1e4d7b' },
  { id: 2, title: '客户电话会议', time: '14:00', location: '线上', color: '#0d9488' },
])

const isAdmin = computed(() => userStore.userInfo.role === 'admin')

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--primary-dark': appStore.primaryDark,
  '--success-color': appStore.success,
  '--warning-color': appStore.warning,
  '--danger-color': appStore.danger,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
  '--surface-tint': appStore.surfaceTint,
  '--accent-color': appStore.accent,
}))

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

const updateCurrentTime = () => {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hour}:${minute}:${second}`
}

const goTo = (path) => {
  router.push(path)
}

const fetchStatistics = async () => {
  try {
    const res = await getStatistics()
    totalUsers.value = res.data.total
    adminCount.value = res.data.adminCount
    studentCount.value = res.data.studentCount
    teacherCount.value = res.data.teacherCount
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const getWeatherDesc = (code) => {
  const descMap = {
    0: '晴朗', 1: '晴', 2: '多云', 3: '阴', 45: '雾', 48: '雾',
    51: '小雨', 53: '小雨', 55: '小雨', 56: '冻雨', 57: '冻雨',
    61: '中雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '冻雨',
    71: '小雪', 73: '小雪', 75: '大雪', 77: '雪',
    80: '阵雨', 81: '阵雨', 82: '暴雨',
    95: '雷阵雨', 96: '雷阵雨', 99: '雷阵雨'
  }
  return descMap[code] || '未知'
}

const fetchWeather = async () => {
  const latitude = 29.5630
  const longitude = 106.5516
  const city = '重庆'
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai`)
    const data = await response.json()
    if (data.current && data.daily) {
      weather.value = {
        temp: Math.round(data.current.temperature_2m),
        maxTemp: Math.round(data.daily.temperature_2m_max[0]),
        minTemp: Math.round(data.daily.temperature_2m_min[0]),
        description: getWeatherDesc(data.current.weather_code),
        city: city,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m + 'm/s'
      }
    }
  } catch (error) {
    weather.value = {
      temp: '25', maxTemp: '32', minTemp: '18', description: '晴朗', city: city, humidity: '45', wind: '3m/s'
    }
  }
}

const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || '中'
}

const formatTime = (time) => {
  return time || ''
}

const formatScheduleTime = (time) => {
  return time || ''
}

const toggleTodo = (id) => {
  const todo = todayTodos.value.find(t => t.id === id)
  if (todo) {
    todo.status = todo.status === 'completed' ? 'pending' : 'completed'
    if (todo.status === 'completed') {
      todayCompletedCount.value++
      todayTodoCount.value--
    } else {
      todayCompletedCount.value--
      todayTodoCount.value++
    }
  }
}

let timer = null

onMounted(() => {
  fetchWeather()
  updateCurrentTime()
  timer = setInterval(updateCurrentTime, 1000)
  if (isAdmin.value) {
    fetchStatistics()
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.home-page {
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary, #475569);
}

.welcome-section {
  margin-bottom: 24px;
}

.weather-section {
  margin-bottom: 24px;
}

.stats-section {
  margin-bottom: 24px;
}

.admin-section {
  margin-top: 24px;
}

.content-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.left-panel {
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.weather-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.weather-icon-wrap {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent), color-mix(in srgb, var(--primary-light, #3d7ab5) 20%, transparent));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--primary-color, #1e4d7b);
}

.weather-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.weather-city {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color, #1e4d7b);
  padding: 4px 12px;
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border-radius: 20px;
}

.weather-temp {
  font-size: 40px;
  font-weight: 300;
  color: var(--text-primary, #334155);
}

.weather-desc {
  font-size: 15px;
  color: var(--text-secondary, #64748b);
}

.weather-details {
  display: flex;
  gap: 28px;
}

.weather-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.welcome-card {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border-radius: 16px;
  padding: 36px;
  display: flex;
  align-items: center;
  gap: 28px;
  color: #fff;
  box-shadow: 0 8px 28px color-mix(in srgb, var(--primary-color, #1e4d7b) 25%, transparent);
}

.welcome-icon {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  backdrop-filter: blur(8px);
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 10px;
}

.welcome-desc {
  font-size: 15px;
  opacity: 0.85;
}

.welcome-time {
  font-size: 28px;
  font-weight: 300;
  font-family: 'Courier New', monospace;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, var(--success-color, #0d9488) 0%, color-mix(in srgb, var(--success-color, #0d9488) 70%, white) 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, var(--warning-color, #fbbf24) 0%, color-mix(in srgb, var(--warning-color, #fbbf24) 70%, white) 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, var(--primary-dark, #6d28d9) 0%, var(--primary-color, #8b5cf6) 100%);
}

.stat-icon.todo {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-icon.overdue {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.stat-icon.schedule {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #334155);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.completion-chart-card,
.quick-actions-card,
.todo-preview-card,
.schedule-preview-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #334155);
}

.card-subtitle {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
  margin-left: 8px;
}

.card-more {
  font-size: 13px;
  color: var(--primary-color, #1e4d7b);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.card-more:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.chart-container {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.chart-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring {
  transition: stroke-dashoffset 0.5s ease;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #334155);
}

.ring-label {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-item:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 5%, white);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color, #1e4d7b) 15%, transparent), color-mix(in srgb, var(--primary-light, #3d7ab5) 25%, transparent));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--primary-color, #1e4d7b);
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #475569);
}

.todo-list,
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-muted, #94a3b8);
  gap: 12px;
}

.empty-state i {
  font-size: 32px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.todo-item:hover {
  background: #f1f5f9;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color, #1e4d7b);
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #334155);
  margin-bottom: 6px;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.priority-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.priority-tag.high {
  background: color-mix(in srgb, #ef4444 15%, transparent);
  color: #ef4444;
}

.priority-tag.medium {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  color: #f59e0b;
}

.priority-tag.low {
  background: color-mix(in srgb, #10b981 15%, transparent);
  color: #10b981;
}

.deadline {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.schedule-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.schedule-time {
  min-width: 60px;
}

.time {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color, #1e4d7b);
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #334155);
  margin-bottom: 6px;
}

.schedule-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.location {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

@media (max-width: 1200px) {
  .content-row {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    flex-direction: column;
    align-items: center;
  }

  .weather-card {
    flex-direction: column;
    text-align: center;
  }

  .weather-details {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>