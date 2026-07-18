<template>
  <div class="diary-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">日记</h1>
        <p class="page-desc">记录每日心情与生活</p>
      </div>
      <button class="add-btn" @click="showDiaryModal = true">
        <i class="layui-icon layui-icon-edit"></i>
        写日记
      </button>
    </div>

    <div class="content-row">
      <div class="calendar-panel">
        <div class="calendar-header">
          <button class="nav-btn" @click="prevMonth">
            <i class="layui-icon layui-icon-left"></i>
          </button>
          <span class="current-month">{{ currentYear }}年{{ currentMonth }}月</span>
          <button class="nav-btn" @click="nextMonth">
            <i class="layui-icon layui-icon-right"></i>
          </button>
        </div>
        <div class="week-header">
          <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
        </div>
        <div class="day-grid">
          <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" class="week-row">
            <div v-for="(day, dayIndex) in week" :key="dayIndex" class="day-cell"
              :class="{ 'other-month': !day.currentMonth, 'today': day.isToday, 'selected': isSelected(day.date), 'has-diary': day.hasDiary }"
              @click="selectDate(day.date)">
              <span class="day-number">{{ day.date.getDate() }}</span>
              <div v-if="day.hasDiary" class="diary-indicator" :style="{ background: getDiaryMoodColor(day.date) }">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="diary-panel">
        <div v-if="selectedDiary" class="diary-card">
          <div class="diary-header">
            <div class="diary-date">
              <span class="date-title">{{ selectedDiaryDate }}</span>
              <span class="date-weekday">{{ selectedWeekday }}</span>
            </div>
            <div class="diary-actions">
              <button class="edit-btn" @click="editDiary(selectedDiary)">
                <i class="layui-icon layui-icon-edit"></i>
              </button>
              <button class="delete-btn" @click="deleteDiary(selectedDiary.id)">
                <i class="layui-icon layui-icon-delete"></i>
              </button>
            </div>
          </div>
          <div class="diary-body">
            <div class="diary-meta">
              <div class="mood-tag">
                <span class="mood-icon">{{ getMoodEmoji(selectedDiary.mood) }}</span>
                <span>{{ getMoodText(selectedDiary.mood) }}</span>
              </div>
              <div v-if="selectedDiary.weather" class="weather-tag">
                <i class="layui-icon layui-icon-cloud"></i>
                {{ selectedDiary.weather }}
              </div>
            </div>
            <div class="diary-content">{{ selectedDiary.content }}</div>
            <div v-if="selectedDiary.tags && selectedDiary.tags.length > 0" class="diary-tags">
              <span v-for="tag in selectedDiary.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-diary">
          <i class="layui-icon layui-icon-file"></i>
          <span>{{ hasDiaryForSelectedDate ? '暂无日记' : '选择日期或点击上方按钮写日记' }}</span>
        </div>
      </div>

      <div class="list-panel">
        <div class="panel-header">
          <span class="panel-title">日记列表</span>
        </div>
        <div class="diary-list">
          <div v-for="diary in diaryList" :key="diary.id" class="list-item" :class="{ active: isSelectedDiary(diary) }"
            @click="selectDiary(diary)">
            <div class="list-date">{{ formatListDate(diary.date) }}</div>
            <div class="list-preview">{{ diary.content.slice(0, 50) }}...</div>
            <div class="list-mood">{{ getMoodEmoji(diary.mood) }}</div>
          </div>
          <div v-if="diaryList.length === 0" class="empty-list">
            <i class="layui-icon layui-icon-file"></i>
            <span>暂无日记</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDiaryModal" class="modal-overlay" @click.self="closeDiaryModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingDiary ? '编辑日记' : '写日记' }}</span>
          <button class="modal-close" @click="closeDiaryModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-col-left">
              <div class="info-card">
                <div class="info-card-title">
                  <i class="layui-icon layui-icon-calendar"></i>
                  <span>基本信息</span>
                </div>

                <div class="form-group">
                  <label>日期</label>
                  <input type="date" v-model="formData.date" class="form-input" />
                </div>

                <div class="form-group">
                  <label>今日心情</label>
                  <div class="mood-picker">
                    <button v-for="mood in moods" :key="mood.value" class="mood-btn"
                      :class="{ active: formData.mood === mood.value }" @click="formData.mood = mood.value">
                      <span>{{ mood.emoji }}</span>
                    </button>
                  </div>
                  <div class="selected-mood-text">{{ getMoodText(formData.mood) }}</div>
                </div>

                <div class="form-group">
                  <label>天气情况</label>
                  <div class="weather-input-wrapper">
                    <input type="text" v-model="formData.weather" placeholder="如：晴、多云、小雨" class="form-input" />
                    <div class="weather-suggestions">
                      <span v-for="w in weatherOptions" :key="w" class="weather-tag" @click="formData.weather = w">{{ w
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="info-card">
                <div class="info-card-title">
                  <i class="layui-icon layui-icon-face-smile"></i>
                  <span>表情选择</span>
                </div>
                <div class="emoji-tabs">
                  <button class="emoji-tab" :class="{ active: emojiTab === 'common' }"
                    @click="emojiTab = 'common'">常用</button>
                  <button class="emoji-tab" :class="{ active: emojiTab === 'mood' }"
                    @click="emojiTab = 'mood'">心情</button>
                  <button class="emoji-tab" :class="{ active: emojiTab === 'weather' }"
                    @click="emojiTab = 'weather'">天气</button>
                </div>
                <div class="emoji-grid-small">
                  <span v-for="emoji in currentEmojis" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">{{
                    emoji }}</span>
                </div>
              </div>
            </div>

            <div class="form-col-right">
              <div class="content-card">
                <div class="content-card-header">
                  <span class="content-title">日记内容</span>
                  <span class="content-count">{{ formData.content.length }}字</span>
                </div>
                <textarea v-model="formData.content" placeholder="今天发生了什么有趣的事情？记录下来吧..."
                  class="form-textarea"></textarea>
              </div>

              <div class="tags-card">
                <div class="tags-card-header">
                  <span class="tags-title">标签</span>
                  <span class="tags-hint">添加标签便于分类整理</span>
                </div>
                <input type="text" v-model="tagInput" placeholder="输入标签后按回车添加" class="form-input tag-input"
                  @keyup.enter="addTag" />
                <div v-if="formData.tags && formData.tags.length > 0" class="tag-list">
                  <span v-for="tag in formData.tags" :key="tag" class="tag-item">
                    <i class="layui-icon layui-icon-tag"></i>
                    {{ tag }}
                    <button @click="removeTag(tag)">×</button>
                  </span>
                </div>
                <div v-else class="tags-empty">暂无标签</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDiaryModal">取消</button>
          <button class="btn-confirm" @click="saveDiary">{{ editingDiary ? '保存修改' : '保存日记' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { dataManager } from '@/utils/dataManager'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedDiary = ref(null)
const diaries = ref([])

const showDiaryModal = ref(false)
const editingDiary = ref(null)
const tagInput = ref('')
const showEmojiPicker = ref(false)
const emojiTab = ref('common')

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const commonEmojis = ['👍', '👏', '🎉', '❤️', '😊', '😁', '😂', '🤣', '🙂', '🥰', '😘', '😍', '🤗', '🤔', '👍', '👎', '👏', '🙌', '💪', '✊', '🙏']
const moodEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️']
const weatherEmojis = ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '🌪️', '🌫️', '🌈', '🌙', '⭐', '🌟', '✨', '🔥', '💧', '💦', '🎄', '🎅', '🎆', '🎇', '🎉', '🎊', '🎁', '🎈', '🎀', '🎎']

const weatherOptions = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '阵雨', '雷阵雨', '雪', '大风', '雾', '霾']

const currentEmojis = computed(() => {
  switch (emojiTab.value) {
    case 'mood': return moodEmojis
    case 'weather': return weatherEmojis
    default: return commonEmojis
  }
})

const moods = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'relaxed', label: '放松', emoji: '😎' },
  { value: 'anxious', label: '焦虑', emoji: '😰' },
  { value: 'tired', label: '疲惫', emoji: '😫' },
  { value: '烦躁', label: '烦躁', emoji: '😤' },
]

const moodColors = {
  happy: '#10b981',
  calm: '#3b82f6',
  relaxed: '#8b5cf6',
  anxious: '#f59e0b',
  tired: '#64748b',
  烦躁: '#ef4444'
}

const formData = reactive({
  date: '',
  mood: 'happy',
  weather: '',
  content: '',
  tags: []
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const selectedDiaryDate = computed(() => {
  return `${selectedDate.value.getFullYear()}年${selectedDate.value.getMonth() + 1}月${selectedDate.value.getDate()}日`
})

const selectedWeekday = computed(() => {
  return weekDays[selectedDate.value.getDay()]
})

const hasDiaryForSelectedDate = computed(() => {
  const dateStr = formatDate(selectedDate.value)
  return diaries.value.some(d => d.date === dateStr)
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
    days.push({ date: d, currentMonth: false, isToday: isToday(d), hasDiary: hasDiary(d) })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({ date: d, currentMonth: true, isToday: isToday(d), hasDiary: hasDiary(d) })
  }

  const endDay = lastDay.getDay()
  for (let i = 1; i <= 6 - endDay; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, currentMonth: false, isToday: isToday(d), hasDiary: hasDiary(d) })
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

const diaryList = computed(() => {
  return diaries.value.sort((a, b) => new Date(b.date) - new Date(a.date))
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

const hasDiary = (date) => {
  const dateStr = formatDate(date)
  return diaries.value.some(d => d.date === dateStr)
}

const getDiaryMoodColor = (date) => {
  const dateStr = formatDate(date)
  const diary = diaries.value.find(d => d.date === dateStr)
  return diary ? moodColors[diary.mood] || '#94a3b8' : '#94a3b8'
}

const getMoodEmoji = (mood) => {
  const m = moods.find(x => x.value === mood)
  return m ? m.emoji : '😐'
}

const getMoodText = (mood) => {
  const m = moods.find(x => x.value === mood)
  return m ? m.label : '未知'
}

const formatListDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const isSelectedDiary = (diary) => {
  return selectedDiary.value && selectedDiary.value.id === diary.id
}

const loadDiaries = () => {
  diaries.value = dataManager.diaries.getAll()
}

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

const selectDate = (date) => {
  selectedDate.value = new Date(date)
  const dateStr = formatDate(date)
  selectedDiary.value = diaries.value.find(d => d.date === dateStr) || null
}

const selectDiary = (diary) => {
  selectedDiary.value = diary
  selectedDate.value = new Date(diary.date)
  currentDate.value = new Date(diary.date)
}

const editDiary = (diary) => {
  editingDiary.value = { ...diary }
  formData.date = diary.date
  formData.mood = diary.mood
  formData.weather = diary.weather || ''
  formData.content = diary.content
  formData.tags = diary.tags ? [...diary.tags] : []
  showDiaryModal.value = true
}

const closeDiaryModal = () => {
  showDiaryModal.value = false
  editingDiary.value = null
  tagInput.value = ''
  showEmojiPicker.value = false
  formData.date = ''
  formData.mood = 'happy'
  formData.weather = ''
  formData.content = ''
  formData.tags = []
}

const insertEmoji = (emoji) => {
  formData.content += emoji
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (tag) => {
  const index = formData.tags.indexOf(tag)
  if (index !== -1) formData.tags.splice(index, 1)
}

const saveDiary = () => {
  if (!formData.content.trim()) {
    layer.msg('请输入日记内容', { icon: 5 })
    return
  }
  if (!formData.date) {
    formData.date = formatDate(new Date())
  }
  if (editingDiary.value) {
    dataManager.diaries.update({ ...formData, id: editingDiary.value.id })
    loadDiaries()
    const dateStr = formatDate(selectedDate.value)
    selectedDiary.value = diaries.value.find(d => d.date === dateStr) || null
    layer.msg('修改成功', { icon: 1 })
  } else {
    const newDiary = dataManager.diaries.add(formData)
    loadDiaries()
    selectedDiary.value = newDiary
    selectedDate.value = new Date(formData.date)
    currentDate.value = new Date(formData.date)
    layer.msg('保存成功', { icon: 1 })
  }
  closeDiaryModal()
}

const deleteDiary = (id) => {
  if (confirm('确定删除该日记吗？')) {
    const success = dataManager.diaries.delete(id)
    if (success) {
      diaries.value = diaries.value.filter(d => String(d.id) !== String(id))
      selectedDiary.value = null
      layer.msg('删除成功', { icon: 1 })
    } else {
      layer.msg('删除失败', { icon: 5 })
    }
  }
}

onMounted(() => {
  loadDiaries()
})
</script>

<style scoped>
.diary-page {
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.content-row {
  display: flex;
  gap: 24px;
}

.calendar-panel {
  width: 280px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
}

.current-month {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.week-day {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  padding: 4px;
}

.day-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.day-cell:hover {
  background: #f1f5f9;
}

.day-cell.other-month {
  opacity: 0.4;
}

.day-cell.today {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 15%, transparent);
  border: 2px solid var(--primary-color, #1e4d7b);
}

.day-cell.selected {
  background: var(--primary-color, #1e4d7b);
  color: #fff;
}

.day-cell.selected .day-number {
  color: #fff;
}

.day-number {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.diary-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.diary-panel {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.diary-card {
  height: 100%;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.diary-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-title {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
}

.date-weekday {
  font-size: 14px;
  color: #64748b;
}

.diary-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 8px;
  background: #f8fafc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.edit-btn {
  color: #64748b;
}

.delete-btn {
  color: #ef4444;
}

.diary-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-meta {
  display: flex;
  gap: 16px;
}

.mood-tag,
.weather-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
}

.mood-icon {
  font-size: 16px;
}

.diary-content {
  font-size: 15px;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}

.diary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
  border-radius: 12px;
  font-size: 12px;
}

.empty-diary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #94a3b8;
  gap: 12px;
}

.empty-diary i {
  font-size: 48px;
}

.list-panel {
  width: 260px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.diary-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  background: #f1f5f9;
}

.list-item.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border-left: 3px solid var(--primary-color, #1e4d7b);
}

.list-date {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
}

.list-preview {
  font-size: 12px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-mood {
  font-size: 14px;
  margin-top: 4px;
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #94a3b8;
  gap: 8px;
}

.empty-list i {
  font-size: 24px;
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
  border-radius: 16px;
  width: 950px;
  height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #334155;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 0;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
}

.form-row {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.form-col-left {
  width: 280px;
  padding: 20px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.form-col-right {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.mood-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mood-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
}

.mood-btn:hover {
  background: #f1f5f9;
  transform: scale(1.05);
}

.mood-btn.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border-color: var(--primary-color, #1e4d7b);
}

.selected-mood-text {
  margin-top: 8px;
  font-size: 14px;
  color: var(--primary-color, #1e4d7b);
  font-weight: 500;
  text-align: center;
}

.weather-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.weather-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.weather-tag {
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.weather-tag:hover {
  background: #e2e8f0;
  color: #475569;
}

.content-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  flex: 2;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.content-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.content-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.content-count {
  font-size: 13px;
  color: #94a3b8;
}

.form-textarea {
  flex: 1;
  width: 100%;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 16px;
  color: #334155;
  outline: none;
  resize: vertical;
  min-height: 280px;
  line-height: 1.7;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.emoji-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.emoji-tab {
  padding: 5px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emoji-tab:hover {
  background: #e2e8f0;
}

.emoji-tab.active {
  background: var(--primary-color, #1e4d7b);
  color: #fff;
}

.emoji-grid-small {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 150px;
  overflow-y: auto;
}

.tags-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.tags-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.tags-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.tags-hint {
  font-size: 12px;
  color: #94a3b8;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
  border-radius: 12px;
  font-size: 13px;
}

.tag-item button {
  background: none;
  border: none;
  color: var(--primary-color, #1e4d7b);
  cursor: pointer;
  font-size: 14px;
}

.tags-empty {
  margin-top: 12px;
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  padding: 10px;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.emoji-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.emoji-item:hover {
  background: #f1f5f9;
  transform: scale(1.2);
}

.form-row {
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mood-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
}

.mood-btn.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border-color: var(--primary-color, #1e4d7b);
}

.mood-btn span:first-child {
  font-size: 18px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
  border-radius: 12px;
  font-size: 12px;
}

.tag-item button {
  background: none;
  border: none;
  color: var(--primary-color, #1e4d7b);
  cursor: pointer;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  padding: 10px 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-confirm {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

@media (max-width: 1200px) {
  .content-row {
    flex-direction: column;
  }

  .calendar-panel,
  .list-panel {
    width: 100%;
  }

  .calendar-panel {
    max-width: 400px;
  }
}
</style>