<template>
  <div class="pomodoro-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">番茄钟</h1>
        <p class="page-desc">专注计时，提升效率</p>
      </div>
    </div>

    <div class="content-row">
      <div class="timer-panel">
        <div class="timer-card">
          <div class="timer-display">
            <div class="time-circle">
              <svg viewBox="0 0 200 200" class="timer-svg">
                <circle cx="100" cy="100" r="88" fill="none" stroke="#f1f5f9" stroke-width="8" />
                <circle cx="100" cy="100" r="88" fill="none" :stroke="timerColor" stroke-width="8"
                  :stroke-dasharray="553" :stroke-dashoffset="553 * (1 - progress)"
                  stroke-linecap="round" class="timer-progress" />
              </svg>
              <div class="time-content">
                <div class="time-text">{{ formattedTime }}</div>
                <div class="timer-mode">{{ isBreak ? '休息时间' : '专注时间' }}</div>
              </div>
            </div>
          </div>

          <div class="timer-controls">
            <button class="control-btn" @click="toggleTimer">
              <i class="layui-icon" :class="isRunning ? 'layui-icon-pause' : 'layui-icon-play'"></i>
              {{ isRunning ? '暂停' : '开始' }}
            </button>
            <button class="control-btn secondary" @click="resetTimer">
              <i class="layui-icon layui-icon-refresh"></i>
              重置
            </button>
          </div>

          <div class="timer-settings">
            <div class="setting-item">
              <span class="setting-label">专注时长</span>
              <input type="number" v-model.number="focusTime" min="5" max="60" class="setting-input" />
              <span class="setting-unit">分钟</span>
            </div>
            <div class="setting-item">
              <span class="setting-label">休息时长</span>
              <input type="number" v-model.number="breakTime" min="1" max="30" class="setting-input" />
              <span class="setting-unit">分钟</span>
            </div>
          </div>
        </div>

        <div class="task-select-card">
          <div class="card-header">
            <span class="card-title">关联任务</span>
          </div>
          <select v-model="selectedTaskId" class="task-select">
            <option value="">选择任务</option>
            <option v-for="task in todoTasks" :key="task.id" :value="task.id">{{ task.title }}</option>
          </select>
          <div v-if="selectedTask" class="selected-task">
            <span>{{ selectedTask.title }}</span>
            <span class="priority-tag" :class="selectedTask.priority">{{ getPriorityText(selectedTask.priority) }}</span>
          </div>
        </div>
      </div>

      <div class="stats-panel">
        <div class="stats-card">
          <div class="card-header">
            <span class="card-title">今日统计</span>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ todayPomodoros }}</div>
              <div class="stat-label">完成番茄</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayFocusMinutes }}</div>
              <div class="stat-label">专注分钟</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayBreakMinutes }}</div>
              <div class="stat-label">休息分钟</div>
            </div>
          </div>
        </div>

        <div class="history-card">
          <div class="card-header">
            <span class="card-title">本周记录</span>
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
          </div>
          <div class="record-list">
            <div v-for="record in recentRecords" :key="record.id" class="record-item">
              <div class="record-time">
                <i :class="record.isBreak ? 'layui-icon layui-icon-coffee' : 'layui-icon layui-icon-clock'"></i>
                <span>{{ formatRecordTime(record) }}</span>
              </div>
              <div class="record-info">
                <span>{{ record.isBreak ? '休息' : '专注' }}</span>
                <span class="record-duration">{{ record.duration }}分钟</span>
              </div>
              <div v-if="record.task" class="record-task">{{ record.task }}</div>
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

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 4px;
}

.content-row {
  display: flex;
  gap: 24px;
}

.timer-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timer-card {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.timer-display {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.time-circle {
  position: relative;
  width: 220px;
  height: 220px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-progress {
  transition: stroke-dashoffset 1s linear;
}

.time-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time-text {
  font-size: 48px;
  font-weight: 300;
  color: #334155;
  font-family: 'Courier New', monospace;
}

.timer-mode {
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, #ef4444 30%, transparent);
}

.control-btn.secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.control-btn.secondary:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.timer-settings {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: #64748b;
}

.setting-input {
  width: 60px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  outline: none;
}

.setting-input:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.setting-unit {
  font-size: 13px;
  color: #94a3b8;
}

.task-select-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.task-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  outline: none;
}

.selected-task {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.selected-task span:first-child {
  font-size: 14px;
  color: #334155;
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

.stats-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #334155;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.history-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.week-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-container {
  width: 32px;
  height: 80px;
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
  font-size: 12px;
  color: #94a3b8;
}

.bar-value {
  font-size: 11px;
  color: #64748b;
}

.records-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  flex: 1;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #334155;
}

.record-time i {
  color: #94a3b8;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-info span:first-child {
  font-size: 13px;
  color: #64748b;
}

.record-duration {
  font-size: 12px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 8px;
}

.record-task {
  flex: 1;
  font-size: 13px;
  color: var(--primary-color, #1e4d7b);
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #94a3b8;
  gap: 8px;
}

.empty-records i {
  font-size: 24px;
}

@media (max-width: 900px) {
  .content-row {
    flex-direction: column;
  }

  .timer-panel {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .time-circle {
    width: 180px;
    height: 180px;
  }

  .time-text {
    font-size: 36px;
  }
}
</style>