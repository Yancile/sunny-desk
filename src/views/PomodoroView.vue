<template>
  <div class="pomodoro-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">番茄钟</h1>
        <p class="page-desc">专注计时，提升效率</p>
      </div>
      <div class="header-stats">
        <div class="header-stat-item">
          <span class="header-stat-value">{{ todayPomodoros }}</span>
          <span class="header-stat-label">番茄</span>
        </div>
        <div class="header-stat-divider"></div>
        <div class="header-stat-item">
          <span class="header-stat-value">{{ todayFocusMinutes }}</span>
          <span class="header-stat-label">分钟</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="center-section">
        <div class="timer-card">
          <div class="mode-tabs">
            <button 
              class="mode-tab" 
              :class="{ active: !isBreak }"
              @click="switchToFocus"
            >
              <i class="layui-icon layui-icon-focus"></i>
              专注
            </button>
            <button 
              class="mode-tab" 
              :class="{ active: isBreak }"
              @click="switchToBreak"
            >
              <i class="layui-icon layui-icon-coffee"></i>
              休息
            </button>
          </div>

          <div class="timer-display">
            <div class="time-circle-wrapper">
              <div class="time-circle" :class="{ 'is-running': isRunning }">
                <svg viewBox="0 0 200 200" class="timer-svg">
                  <circle cx="100" cy="100" r="88" fill="none" stroke="#f1f5f9" stroke-width="8" />
                  <circle cx="100" cy="100" r="88" fill="none" :stroke="timerColor" stroke-width="8"
                    :stroke-dasharray="553" :stroke-dashoffset="553 * (1 - progress)"
                    stroke-linecap="round" class="timer-progress" />
                  <circle cx="100" cy="100" r="78" fill="none" :stroke="timerColor" stroke-width="2"
                    stroke-linecap="round" :stroke-dasharray="490" :stroke-dashoffset="490 * (1 - progress) * 0.5"
                    class="timer-progress-inner" />
                </svg>
                <div class="time-content">
                  <div class="time-text">{{ formattedTime }}</div>
                  <div class="timer-mode">{{ isBreak ? '休息时间' : '专注时间' }}</div>
                </div>
              </div>
              <div class="circle-decoration" v-if="isRunning">
                <div class="decoration-ring ring-1"></div>
                <div class="decoration-ring ring-2"></div>
              </div>
            </div>
          </div>

          <div class="timer-controls">
            <button class="control-btn reset-btn" @click="resetTimer">
              <i class="layui-icon layui-icon-refresh"></i>
            </button>
            <button class="control-btn main-btn" @click="toggleTimer">
              <i class="layui-icon" :class="isRunning ? 'layui-icon-pause' : 'layui-icon-play'"></i>
              <span>{{ isRunning ? '暂停' : '开始' }}</span>
            </button>
            <button class="control-btn skip-btn" @click="skipTimer">
              <i class="layui-icon layui-icon-next"></i>
            </button>
          </div>

          <div class="timer-settings">
            <div class="setting-group">
              <label class="setting-label">专注时长</label>
              <div class="setting-input-group">
                <button class="setting-btn" @click="adjustFocusTime(-5)" :disabled="focusTime <= 5">-</button>
                <input type="number" v-model.number="focusTime" min="5" max="60" class="setting-input" readonly />
                <button class="setting-btn" @click="adjustFocusTime(5)" :disabled="focusTime >= 60">+</button>
              </div>
              <span class="setting-unit">分钟</span>
            </div>
            <div class="setting-divider"></div>
            <div class="setting-group">
              <label class="setting-label">休息时长</label>
              <div class="setting-input-group">
                <button class="setting-btn" @click="adjustBreakTime(-1)" :disabled="breakTime <= 1">-</button>
                <input type="number" v-model.number="breakTime" min="1" max="30" class="setting-input" readonly />
                <button class="setting-btn" @click="adjustBreakTime(1)" :disabled="breakTime >= 30">+</button>
              </div>
              <span class="setting-unit">分钟</span>
            </div>
          </div>
        </div>
      </div>

      <div class="side-section">
        <div class="task-card">
          <div class="card-header">
            <span class="card-title">关联任务</span>
            <i class="layui-icon layui-icon-list"></i>
          </div>
          <select v-model="selectedTaskId" class="task-select">
            <option value="">选择任务</option>
            <option v-for="task in todoTasks" :key="task.id" :value="task.id">{{ task.title }}</option>
          </select>
          <div v-if="selectedTask" class="selected-task">
            <div class="task-info">
              <span class="task-title">{{ selectedTask.title }}</span>
              <span class="priority-tag" :class="selectedTask.priority">{{ getPriorityText(selectedTask.priority) }}</span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <div class="card-header">
            <span class="card-title">今日统计</span>
            <i class="layui-icon layui-icon-chart"></i>
          </div>
          <div class="stats-grid">
            <div class="stat-item" :class="{ highlight: todayPomodoros > 0 }">
              <div class="stat-icon-box focus">
                <i class="layui-icon layui-icon-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ todayPomodoros }}</div>
                <div class="stat-label">完成番茄</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-box work">
                <i class="layui-icon layui-icon-file"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ todayFocusMinutes }}</div>
                <div class="stat-label">专注分钟</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-box rest">
                <i class="layui-icon layui-icon-coffee"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ todayBreakMinutes }}</div>
                <div class="stat-label">休息分钟</div>
              </div>
            </div>
          </div>
        </div>

        <div class="history-card">
          <div class="card-header">
            <span class="card-title">本周记录</span>
            <i class="layui-icon layui-icon-calendar"></i>
          </div>
          <div class="week-chart">
            <div v-for="day in weekDays" :key="day.label" class="chart-bar">
              <div class="bar-container">
                <div class="bar-fill" :style="{ height: getDayMinutes(day.date) + '%' }"></div>
              </div>
              <span class="bar-label">{{ day.label }}</span>
              <span class="bar-value">{{ getDayMinutes(day.date) }}m</span>
            </div>
          </div>
        </div>

        <div class="records-card">
          <div class="card-header">
            <span class="card-title">最近记录</span>
            <i class="layui-icon layui-icon-time"></i>
          </div>
          <div class="record-list">
            <div v-for="record in recentRecords" :key="record.id" class="record-item">
              <div class="record-indicator" :class="record.isBreak ? 'break' : 'focus'"></div>
              <div class="record-content">
                <div class="record-header">
                  <span class="record-time">{{ formatRecordTime(record) }}</span>
                  <span class="record-type" :class="record.isBreak ? 'break' : 'focus'">
                    {{ record.isBreak ? '休息' : '专注' }}
                  </span>
                </div>
                <div v-if="record.task" class="record-task">{{ record.task }}</div>
                <div class="record-duration">{{ record.duration }}分钟</div>
              </div>
            </div>
            <div v-if="recentRecords.length === 0" class="empty-records">
              <i class="layui-icon layui-icon-clock"></i>
              <span>暂无记录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

const focusTime = ref(25)
const breakTime = ref(5)
const isRunning = ref(false)
const isBreak = ref(false)
const timeLeft = ref(25 * 60)
const selectedTaskId = ref(null)

const todoTasks = ref([
  { id: 1, title: '完成项目文档', priority: 'high' },
  { id: 2, title: '代码审查', priority: 'medium' },
  { id: 3, title: '学习Vue3', priority: 'medium' },
  { id: 4, title: '整理笔记', priority: 'low' },
])

const records = ref([
  { id: 1, date: '2026-07-01T09:00', duration: 25, isBreak: false, task: '完成项目文档' },
  { id: 2, date: '2026-07-01T09:30', duration: 5, isBreak: true },
  { id: 3, date: '2026-07-01T10:00', duration: 25, isBreak: false, task: '代码审查' },
  { id: 4, date: '2026-06-30T14:00', duration: 25, isBreak: false, task: '学习Vue3' },
  { id: 5, date: '2026-06-30T14:30', duration: 5, isBreak: true },
])

let timer = null

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const selectedTask = computed(() => {
  return todoTasks.value.find(t => t.id === selectedTaskId.value)
})

const totalTime = computed(() => (isBreak.value ? breakTime.value : focusTime.value) * 60)

const progress = computed(() => {
  return timeLeft.value / totalTime.value
})

const timerColor = computed(() => {
  return isBreak.value ? '#10b981' : '#ef4444'
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const todayPomodoros = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return records.value.filter(r => r.date.startsWith(today) && !r.isBreak).length
})

const todayFocusMinutes = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return records.value.filter(r => r.date.startsWith(today) && !r.isBreak).reduce((sum, r) => sum + r.duration, 0)
})

const todayBreakMinutes = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return records.value.filter(r => r.date.startsWith(today) && r.isBreak).reduce((sum, r) => sum + r.duration, 0)
})

const weekDays = computed(() => {
  const days = []
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push({
      date: date.toISOString().split('T')[0],
      label: weekDays[date.getDay()]
    })
  }
  return days
})

const recentRecords = computed(() => {
  return records.value.slice(0, 5)
})

const getDayMinutes = (dateStr) => {
  const minutes = records.value.filter(r => r.date.startsWith(dateStr) && !r.isBreak).reduce((sum, r) => sum + r.duration, 0)
  return Math.min(minutes / 2, 100)
}

const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || '中'
}

const formatRecordTime = (record) => {
  const date = new Date(record.date)
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const adjustFocusTime = (delta) => {
  const newValue = focusTime.value + delta
  if (newValue >= 5 && newValue <= 60) {
    focusTime.value = newValue
  }
}

const adjustBreakTime = (delta) => {
  const newValue = breakTime.value + delta
  if (newValue >= 1 && newValue <= 30) {
    breakTime.value = newValue
  }
}

const switchToFocus = () => {
  if (!isRunning.value) {
    isBreak.value = false
    timeLeft.value = focusTime.value * 60
  }
}

const switchToBreak = () => {
  if (!isRunning.value) {
    isBreak.value = true
    timeLeft.value = breakTime.value * 60
  }
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const skipTimer = () => {
  pauseTimer()
  
  records.value.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    duration: isBreak.value ? breakTime.value : focusTime.value,
    isBreak: isBreak.value,
    task: selectedTask.value?.title
  })

  isBreak.value = !isBreak.value
  timeLeft.value = (isBreak.value ? breakTime.value : focusTime.value) * 60
}

const startTimer = () => {
  isRunning.value = true
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      completeTimer()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = (isBreak.value ? breakTime.value : focusTime.value) * 60
}

const completeTimer = () => {
  pauseTimer()
  
  records.value.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    duration: isBreak.value ? breakTime.value : focusTime.value,
    isBreak: isBreak.value,
    task: selectedTask.value?.title
  })

  isBreak.value = !isBreak.value
  timeLeft.value = (isBreak.value ? breakTime.value : focusTime.value) * 60

  if (isBreak.value) {
    startTimer()
  }
}

watch([focusTime, breakTime], () => {
  if (!isRunning.value) {
    timeLeft.value = (isBreak.value ? breakTime.value : focusTime.value) * 60
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.pomodoro-page {
  padding: 24px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
}

.header-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ef4444;
}

.header-stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.header-stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

.main-content {
  display: flex;
  gap: 32px;
}

.center-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.timer-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  width: 480px;
}

.mode-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
  background: #f8fafc;
  padding: 4px;
  border-radius: 12px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.mode-tab:hover {
  background: #f1f5f9;
}

.mode-tab.active {
  background: #fff;
  color: #ef4444;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mode-tab.active:nth-child(2) {
  color: #10b981;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: 36px;
}

.time-circle-wrapper {
  position: relative;
}

.time-circle {
  position: relative;
  width: 280px;
  height: 280px;
  transition: transform 0.3s ease;
}

.time-circle.is-running {
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-progress {
  transition: stroke-dashoffset 1s linear;
}

.timer-progress-inner {
  transition: stroke-dashoffset 1s linear;
  opacity: 0.3;
}

.time-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time-text {
  font-size: 56px;
  font-weight: 300;
  color: #1e293b;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  letter-spacing: 4px;
}

.timer-mode {
  font-size: 16px;
  color: #64748b;
  margin-top: 12px;
}

.circle-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.decoration-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
}

.ring-1 {
  width: 300px;
  height: 300px;
  border-color: rgba(239, 68, 68, 0.1);
  animation: ring-pulse-1 3s ease-out infinite;
}

.ring-2 {
  width: 320px;
  height: 320px;
  border-color: rgba(239, 68, 68, 0.05);
  animation: ring-pulse-2 4s ease-out infinite;
}

@keyframes ring-pulse-1 {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes ring-pulse-2 {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.timer-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.reset-btn, .skip-btn {
  width: 48px;
  height: 48px;
  background: #f8fafc;
  color: #64748b;
  font-size: 18px;
}

.reset-btn:hover, .skip-btn:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.main-btn {
  padding: 16px 40px;
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.main-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
}

.main-btn:active {
  transform: translateY(0);
}

.timer-settings {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.setting-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  color: #94a3b8;
}

.setting-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #334155;
}

.setting-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.setting-input {
  width: 64px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: #1e293b;
  outline: none;
}

.setting-input:focus {
  border-color: #ef4444;
}

.setting-unit {
  font-size: 12px;
  color: #94a3b8;
}

.setting-divider {
  width: 1px;
  height: 48px;
  background: #e2e8f0;
}

.side-section {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-card, .stats-card, .history-card, .records-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.card-header i {
  font-size: 16px;
  color: #94a3b8;
}

.task-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  outline: none;
  background: #f8fafc;
}

.task-select:focus {
  border-color: #ef4444;
}

.selected-task {
  margin-top: 14px;
  padding: 14px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 12px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-title {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.priority-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.priority-tag.high {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.priority-tag.medium {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.priority-tag.low {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.stat-item.highlight {
  background: linear-gradient(135deg, #fef2f2 0%, #f8fafc 100%);
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.stat-icon-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 18px;
}

.stat-icon-box.focus {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-icon-box.work {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon-box.rest {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.week-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-container {
  width: 28px;
  height: 70px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #ef4444 0%, #f87171 100%);
  border-radius: 8px;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 11px;
  color: #94a3b8;
}

.bar-value {
  font-size: 10px;
  color: #64748b;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.record-indicator {
  width: 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.record-indicator.focus {
  background: #ef4444;
}

.record-indicator.break {
  background: #10b981;
}

.record-content {
  flex: 1;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.record-time {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.record-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
}

.record-type.focus {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.record-type.break {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.record-task {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.record-duration {
  font-size: 12px;
  color: #94a3b8;
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  color: #94a3b8;
  gap: 8px;
}

.empty-records i {
  font-size: 24px;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .center-section {
    width: 100%;
  }

  .timer-card {
    width: 100%;
    max-width: 480px;
  }

  .side-section {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .task-card, .stats-card, .history-card, .records-card {
    flex: 1;
    min-width: 280px;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-stats {
    width: 100%;
  }

  .timer-card {
    padding: 24px;
  }

  .time-circle {
    width: 220px;
    height: 220px;
  }

  .time-text {
    font-size: 44px;
  }

  .side-section {
    flex-direction: column;
  }
}
</style>
