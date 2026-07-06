<template>
  <div class="schedule-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">日程管理</h1>
        <p class="page-desc">管理您的日常日程安排</p>
      </div>
      <button class="add-btn" @click="showEventModal = true">
        <i class="layui-icon layui-icon-add-circle"></i>
        添加事件
      </button>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon today-icon">
          <i class="layui-icon layui-icon-calendar"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ todayEventsCount }}</div>
          <div class="stat-label">今日事件</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon week-icon">
          <i class="layui-icon layui-icon-list"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ weekEventsCount }}</div>
          <div class="stat-label">本周事件</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon month-icon">
          <i class="layui-icon layui-icon-date"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ monthEventsCount }}</div>
          <div class="stat-label">本月事件</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed-icon">
          <i class="layui-icon layui-icon-check"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ completedEventsCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="calendar-panel">
        <div class="calendar-header">
          <div class="calendar-nav">
            <button class="nav-btn" @click="prevMonth">
              <i class="layui-icon layui-icon-left"></i>
            </button>
            <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
            <button class="nav-btn" @click="nextMonth">
              <i class="layui-icon layui-icon-right"></i>
            </button>
          </div>
          <button class="today-btn" @click="goToToday">今天</button>
        </div>

        <div class="weekdays-header">
          <div v-for="day in weekDays" :key="day" class="weekday-item" :class="{ weekend: day === '日' || day === '六' }">
            {{ day }}
          </div>
        </div>

        <div class="calendar-grid" :key="forceUpdate">
          <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" class="calendar-week">
            <div v-for="(day, dayIndex) in week" :key="dayIndex" class="calendar-day" :class="{
              'other-month': !day.currentMonth,
              'today': day.isToday,
              'selected': isSelected(day.date),
              'has-event': day.hasEvent,
              'weekend': weekDays[(day.date.getDay() + 7) % 7] === '日' || weekDays[(day.date.getDay() + 7) % 7] === '六'
            }" @click="selectDate(day.date)">
              <span class="day-number">{{ day.date.getDate() }}</span>
              <div v-if="day.isToday" class="today-badge"></div>
              <div v-if="day.events && day.events.length > 0" class="day-events">
                <div v-for="(event, idx) in day.events.slice(0, 3)" :key="idx" class="event-item"
                  :title="`${event.title}\n${event.time || '全天'}\n${event.location || ''}\n${event.description || ''}`">
                  <span class="event-dot" :style="{ background: event.color }"></span>
                  <div class="event-info">
                    <span class="event-name">{{ truncateTitle(event.title, 6) }}</span>
                    <span class="event-time">{{ event.time || '全天' }}</span>
                  </div>
                </div>
                <div v-if="day.events.length > 3" class="more-events">+{{ day.events.length - 3 }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="legend-section">
          <div class="legend-title">事件分类</div>
          <div class="legend-items">
            <div v-for="cat in eventCategories" :key="cat.value" class="legend-item">
              <span class="legend-dot" :style="{ background: cat.color }"></span>
              <span class="legend-label">{{ cat.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="events-panel">
        <div class="panel-header">
          <div class="panel-title-row">
            <span class="panel-title">{{ selectedDateStr }}</span>
            <span class="panel-weekday">{{ selectedWeekday }}</span>
          </div>
          <button class="quick-add-btn" @click="quickAddEvent">
            <i class="layui-icon layui-icon-add"></i>
          </button>
        </div>

        <div class="events-list" :key="forceUpdate">
          <div v-for="event in dayEvents" :key="event.id" class="event-card" :style="{ borderTopColor: event.color }">
            <div class="event-header">
              <div class="event-time-badge" :style="{ background: event.color }">
                {{ event.time }}
              </div>
              <div class="event-category-tag" :style="{ background: colorMix(event.color, 0.15), color: event.color }">
                {{ getCategoryLabel(event.color) }}
              </div>
              <div v-if="event.repeat !== 'none'" class="repeat-tag">
                <i class="layui-icon layui-icon-refresh"></i>
                {{ getRepeatText(event.repeat) }}
              </div>
            </div>
            <div class="event-body">
              <h3 class="event-title">{{ event.title }}</h3>
              <div v-if="event.location" class="event-location">
                <i class="layui-icon layui-icon-map"></i>
                {{ event.location }}
              </div>
              <div v-if="event.description" class="event-desc">{{ event.description }}</div>
            </div>
            <div class="event-footer">
              <button class="event-action-btn edit" @click="editEvent(event)">
                <i class="layui-icon layui-icon-edit"></i>
                编辑
              </button>
              <button class="event-action-btn delete" @click="deleteEvent(event.id)">
                <i class="layui-icon layui-icon-delete"></i>
                删除
              </button>
            </div>
          </div>

          <div v-if="dayEvents.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="layui-icon layui-icon-calendar"></i>
            </div>
            <div class="empty-text">暂无日程安排</div>
            <button class="empty-add-btn" @click="quickAddEvent">添加新事件</button>
          </div>
        </div>

        <div class="upcoming-section">
          <div class="section-title">近期日程</div>
          <div class="upcoming-list">
            <div v-for="event in upcomingEvents" :key="event.id" class="upcoming-item">
              <div class="upcoming-date">
                <div class="upcoming-day">{{ getDay(event.date) }}</div>
                <div class="upcoming-month">{{ getMonth(event.date) }}</div>
              </div>
              <div class="upcoming-content">
                <div class="upcoming-time">{{ event.time }}</div>
                <div class="upcoming-title">{{ event.title }}</div>
              </div>
              <div class="upcoming-dot" :style="{ background: event.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEventModal" class="modal-overlay" @click.self="closeEventModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingEvent ? '编辑事件' : '添加事件' }}</span>
          <button class="modal-close" @click="closeEventModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>事件标题</label>
            <input type="text" v-model="formData.title" placeholder="请输入事件标题" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>日期</label>
              <input type="date" v-model="formData.date" class="form-input" />
            </div>
            <div class="form-group">
              <label>时间</label>
              <input type="time" v-model="formData.time" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>地点</label>
            <input type="text" v-model="formData.location" placeholder="请输入地点" class="form-input" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="formData.description" placeholder="请输入备注" class="form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <div class="category-picker">
                <button v-for="cat in eventCategories" :key="cat.value" class="category-btn"
                  :class="{ active: formData.color === cat.color }" :style="{ background: cat.color }"
                  @click="formData.color = cat.color">
                  <span class="category-icon">{{ cat.label }}</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>重复</label>
              <select v-model="formData.repeat" class="form-select">
                <option value="none">不重复</option>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEventModal">取消</button>
          <button class="btn-primary" @click="saveEvent">{{ editingEvent ? '保存修改' : '添加事件' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'
import { dataManager } from '@/utils/dataManager'

const appStore = useAppStore()

const viewMode = ref('month')
const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const events = ref([])
const forceUpdate = ref(0)
const refreshKey = ref(0)

watch(
  () => events.value.length,
  () => {
    forceUpdate.value++
  },
  { deep: true }
)

const loadEvents = () => {
  events.value = dataManager.schedules.getAll()
  refreshKey.value++
}

onMounted(() => {
  loadEvents()
})

const showEventModal = ref(false)
const editingEvent = ref(null)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const eventCategories = [
  { value: 'work', label: '工作', color: '#1e4d7b' },
  { value: 'personal', label: '个人', color: '#0d9488' },
  { value: 'study', label: '学习', color: '#fbbf24' },
  { value: 'health', label: '健康', color: '#ef4444' },
  { value: 'other', label: '其他', color: '#8b5cf6' }
]

const formData = reactive({
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
  color: '#1e4d7b',
  repeat: 'none'
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const selectedDateStr = computed(() => {
  return `${selectedDate.value.getFullYear()}年${selectedDate.value.getMonth() + 1}月${selectedDate.value.getDate()}日`
})

const selectedWeekday = computed(() => {
  return weekDays[selectedDate.value.getDay()]
})

const todayEventsCount = computed(() => {
  const today = formatDate(new Date())
  return events.value.filter(e => e.date === today).length
})

const weekEventsCount = computed(() => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return events.value.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate >= startOfWeek && eventDate <= endOfWeek
  }).length
})

const monthEventsCount = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  return events.value.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate.getFullYear() === year && eventDate.getMonth() === month
  }).length
})

const completedEventsCount = computed(() => {
  return events.value.filter(e => e.completed).length
})

const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  const startDay = firstDay.getDay()
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, currentMonth: false, isToday: isToday(d), hasEvent: hasEvent(d), events: getDayEvents(d) })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ date: d, currentMonth: true, isToday: isToday(d), hasEvent: hasEvent(d), events: getDayEvents(d) })
  }

  const endDay = lastDay.getDay()
  for (let i = 1; i <= 6 - endDay; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, currentMonth: false, isToday: isToday(d), hasEvent: hasEvent(d), events: getDayEvents(d) })
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

const dayEvents = computed(() => {
  const dateStr = formatDate(selectedDate.value)
  return events.value.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time))
})

const upcomingEvents = computed(() => {
  const today = formatDate(new Date())
  return events.value
    .filter(e => e.date >= today)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
    .slice(0, 5)
})

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isSelected = (date) => {
  return date.toDateString() === selectedDate.value.toDateString()
}

const hasEvent = (date) => {
  const dateStr = formatDate(date)
  return events.value.some(e => e.date === dateStr)
}

const getDayEvents = (date) => {
  const dateStr = formatDate(date)
  return events.value.filter(e => e.date === dateStr)
}

const getCategoryLabel = (color) => {
  const cat = eventCategories.find(c => c.color === color)
  return cat ? cat.label : '其他'
}

const getRepeatText = (repeat) => {
  const map = { daily: '每日', weekly: '每周', monthly: '每月', none: '不重复' }
  return map[repeat] || '不重复'
}

const getDay = (dateStr) => {
  return new Date(dateStr).getDate()
}

const getMonth = (dateStr) => {
  return `${new Date(dateStr).getMonth() + 1}月`
}

const colorMix = (color, ratio) => {
  const hex = color.replace('#', '')
  const r = Math.round(parseInt(hex.substring(0, 2), 16) * (1 - ratio) + 255 * ratio)
  const g = Math.round(parseInt(hex.substring(2, 4), 16) * (1 - ratio) + 255 * ratio)
  const b = Math.round(parseInt(hex.substring(4, 6), 16) * (1 - ratio) + 255 * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

const truncateTitle = (title, maxLength) => {
  if (!title) return ''
  if (title.length <= maxLength) return title
  return title.substring(0, maxLength) + '...'
}

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

const selectDate = (date) => {
  selectedDate.value = new Date(date)
}

const quickAddEvent = () => {
  formData.date = formatDate(selectedDate.value)
  formData.time = new Date().toTimeString().slice(0, 5)
  showEventModal.value = true
}

const editEvent = (event) => {
  editingEvent.value = { ...event }
  formData.title = event.title
  formData.date = event.date
  formData.time = event.time
  formData.location = event.location || ''
  formData.description = event.description || ''
  formData.color = event.color
  formData.repeat = event.repeat
  showEventModal.value = true
}

const closeEventModal = () => {
  showEventModal.value = false
  editingEvent.value = null
  formData.title = ''
  formData.date = ''
  formData.time = ''
  formData.location = ''
  formData.description = ''
  formData.color = '#1e4d7b'
  formData.repeat = 'none'
}

const saveEvent = () => {
  if (!formData.title.trim()) {
    layer.msg('请输入事件标题', { icon: 5 })
    return
  }
  if (!formData.date) {
    layer.msg('请选择日期', { icon: 5 })
    return
  }
  if (editingEvent.value) {
    dataManager.schedules.update({
      ...formData,
      id: editingEvent.value.id,
      completed: editingEvent.value.completed
    })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.schedules.add({
      ...formData,
      completed: false
    })
    layer.msg('添加成功', { icon: 1 })
  }
  loadEvents()
  closeEventModal()
}

const deleteEvent = (id) => {
  if (confirm('确定删除该事件吗？')) {
    const success = dataManager.schedules.delete(id)
    if (success) {
      events.value = events.value.filter(e => String(e.id) !== String(id))
      layer.msg('删除成功', { icon: 1 })
    } else {
      layer.msg('删除失败', { icon: 5 })
    }
  }
}
</script>

<style scoped>
.schedule-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
}

.stat-icon.today-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.week-icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.month-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.completed-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

.calendar-panel {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.current-month {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.today-btn {
  padding: 10px 20px;
  background: var(--primary-color, #1e4d7b);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 85%, black);
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.weekday-item {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  padding: 10px;
  border-radius: 8px;
}

.weekday-item.weekend {
  color: #94a3b8;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  min-height: 100px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border: 2px solid var(--primary-color, #1e4d7b);
}

.calendar-day.selected {
  background: var(--primary-color, #1e4d7b);
  color: #fff;
}

.calendar-day.selected .day-number {
  color: #fff;
}

.calendar-day.weekend {
  background: #fef3c7;
}

.calendar-day.weekend.selected {
  background: var(--primary-color, #1e4d7b);
}

.day-number {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.today-badge {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: var(--primary-color, #1e4d7b);
  border-radius: 50%;
}

.calendar-day.selected .today-badge {
  background: #fff;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  flex: 1;
  overflow: hidden;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 4px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.calendar-day.selected .event-item {
  background: rgba(255, 255, 255, 0.2);
}

.calendar-day.selected .event-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.event-name {
  font-size: 11px;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 9px;
  color: #94a3b8;
  white-space: nowrap;
}

.calendar-day.selected .event-name {
  color: rgba(255, 255, 255, 0.9);
}

.calendar-day.selected .event-time {
  color: rgba(255, 255, 255, 0.6);
}

.more-events {
  font-size: 10px;
  color: #94a3b8;
  text-align: center;
  padding: 2px 0;
}

.calendar-day.selected .more-events {
  color: rgba(255, 255, 255, 0.6);
}

.legend-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.legend-title {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  font-size: 13px;
  color: #475569;
}

.events-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.panel-weekday {
  font-size: 15px;
  color: #64748b;
}

.quick-add-btn {
  width: 36px;
  height: 36px;
  background: var(--primary-color, #1e4d7b);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quick-add-btn:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 85%, black);
  transform: scale(1.05);
}

.events-list {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.event-card {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-top: 4px solid;
  margin-bottom: 12px;
}

.event-card:last-child {
  margin-bottom: 0;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.event-time-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.event-category-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.repeat-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
}

.event-body {
  margin-bottom: 12px;
}

.event-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.event-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.event-footer {
  display: flex;
  gap: 8px;
}

.event-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-action-btn.edit {
  background: #f1f5f9;
  color: #64748b;
}

.event-action-btn.edit:hover {
  background: #e2e8f0;
}

.event-action-btn.delete {
  background: #fef2f2;
  color: #ef4444;
}

.event-action-btn.delete:hover {
  background: #fee2e2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon i {
  font-size: 28px;
  color: #94a3b8;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-add-btn {
  padding: 10px 24px;
  background: var(--primary-color, #1e4d7b);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-add-btn:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 85%, black);
}

.upcoming-section {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.upcoming-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
}

.upcoming-day {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.upcoming-month {
  font-size: 11px;
  color: #64748b;
}

.upcoming-content {
  flex: 1;
}

.upcoming-time {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.upcoming-title {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.upcoming-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #64748b;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-btn {
  width: 44px;
  height: 44px;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.category-btn:hover {
  transform: scale(1.05);
}

.category-btn.active {
  border-color: #334155;
  transform: scale(1.1);
}

.category-icon {
  font-size: 12px;
  color: #fff;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .events-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .calendar-day {
    padding: 6px;
  }

  .day-number {
    font-size: 13px;
  }
}
</style>