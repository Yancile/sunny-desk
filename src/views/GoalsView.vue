<template>
  <div class="goals-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">长期目标</h1>
        <p class="page-desc">设定目标，培养习惯，追踪进度</p>
      </div>
      <button class="add-btn" @click="showGoalModal = true">
        <i class="layui-icon layui-icon-add-circle"></i>
        新建目标
      </button>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon goals">
          <i class="layui-icon layui-icon-form"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ goals.length }}</div>
          <div class="stat-label">总目标</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="layui-icon layui-icon-ok"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ completedGoals }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon habits">
          <i class="layui-icon layui-icon-menu-fill"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ habits.length }}</div>
          <div class="stat-label">习惯数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon streak">
          <i class="layui-icon layui-icon-fire"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ maxStreak }}</div>
          <div class="stat-label">最长连续打卡</div>
        </div>
      </div>
    </div>

    <div class="section-title-row">
      <h2 class="section-title">我的目标</h2>
      <div class="filter-tabs">
        <button v-for="tab in filterTabs" :key="tab.value" class="filter-tab"
          :class="{ active: activeFilter === tab.value }" @click="activeFilter = tab.value">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="goals-grid">
      <div v-for="goal in filteredGoals" :key="goal.id" class="goal-card" @click="showGoalDetail(goal)">
        <div class="goal-card-header">
          <div class="goal-category" :class="goal.category">{{ getCategoryText(goal.category) }}</div>
          <div class="goal-actions">
            <button class="action-btn delete" @click.stop="deleteGoal(goal.id)" title="删除">
              <i class="layui-icon layui-icon-delete"></i>
            </button>
          </div>
        </div>
        <div class="goal-card-body">
          <h3 class="goal-title">{{ goal.title }}</h3>
          <p class="goal-desc">{{ goal.description }}</p>
        </div>
        <div class="goal-card-footer">
          <div class="progress-container">
            <div class="progress-ring">
              <svg viewBox="0 0 60 60" class="ring-svg">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#e2e8f0" stroke-width="6" />
                <circle cx="30" cy="30" r="26" fill="none" :stroke="getProgressColor(goal.progress)" stroke-width="6"
                  :stroke-dasharray="163.4" :stroke-dashoffset="163.4 * (1 - goal.progress / 100)"
                  stroke-linecap="round" />
              </svg>
              <span class="ring-text">{{ goal.progress }}%</span>
            </div>
            <div class="progress-info">
              <div class="progress-label">完成进度</div>
              <div class="progress-bar">
                <div class="progress-fill"
                  :style="{ width: goal.progress + '%', background: getProgressColor(goal.progress) }"></div>
              </div>
            </div>
          </div>
          <div class="deadline-info">
            <i class="layui-icon layui-icon-clock"></i>
            <span>{{ goal.deadline }}</span>
          </div>
        </div>
        <div class="milestone-preview">
          <span class="milestone-label">里程碑</span>
          <div class="milestone-dots">
            <div v-for="(m, index) in goal.milestones.slice(0, 5)" :key="index" class="milestone-dot"
              :class="{ completed: m.completed }"></div>
            <span v-if="goal.milestones.length > 5" class="milestone-more">+{{ goal.milestones.length - 5 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title-row">
      <h2 class="section-title">习惯打卡</h2>
      <button class="add-habit-btn" @click="showHabitModal = true">
        <i class="layui-icon layui-icon-add"></i> 添加习惯
      </button>
    </div>

    <div class="habits-grid">
      <div v-for="habit in habits" :key="habit.id" class="habit-card">
        <div class="habit-header">
          <div class="habit-icon" :style="{ background: habit.color }">
            <i :class="habit.icon"></i>
          </div>
          <div class="habit-info">
            <div class="habit-name">{{ habit.name }}</div>
            <div class="habit-streak">🔥 连续 {{ habit.streak }} 天</div>
          </div>
          <div class="habit-actions">
            <button class="habit-action-btn add-todo" @click="addHabitToTodo(habit)" title="添加到待办">
              <i class="layui-icon layui-icon-list"></i>
            </button>
            <button class="habit-action-btn edit" @click="editHabit(habit)" title="编辑">
              <i class="layui-icon layui-icon-edit"></i>
            </button>
            <button class="habit-action-btn delete" @click="deleteHabit(habit.id)" title="删除">
              <i class="layui-icon layui-icon-delete"></i>
            </button>
            <button class="check-btn" :class="{ checked: habit.todayChecked }" @click="toggleHabit(habit.id)">
              <i class="layui-icon layui-icon-check"></i>
            </button>
          </div>
        </div>
        <div class="habit-calendar">
          <div v-for="(day, index) in getLast7Days()" :key="index" class="calendar-day"
            :class="{ checked: habit.checkedDays.includes(day.date) }">
            <span class="day-label">{{ day.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showGoalDetailModal" class="modal-overlay" @click.self="closeGoalDetailModal">
      <div class="modal-content large">
        <div class="modal-header">
          <div class="modal-header-left">
            <select v-if="isEditing" v-model="editForm.category" class="category-select">
              <option v-for="cat in goalCategories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
            <span v-else class="goal-category-badge" :class="selectedGoal?.category">{{
              getCategoryText(selectedGoal?.category)
            }}</span>
            <input v-if="isEditing" v-model="editForm.title" class="title-input" />
            <span v-else class="modal-title">{{ selectedGoal?.title }}</span>
          </div>
          <div class="modal-actions">
            <button v-if="!isEditing" class="edit-btn" @click="startDetailEdit">
              <i class="layui-icon layui-icon-edit"></i> 编辑
            </button>
            <button v-if="isEditing" class="save-btn" @click="saveDetailEdit">
              <i class="layui-icon layui-icon-save"></i> 保存
            </button>
            <button v-if="isEditing" class="cancel-btn" @click="cancelDetailEdit">
              <i class="layui-icon layui-icon-close"></i> 取消
            </button>
            <button class="modal-close" @click="closeGoalDetailModal">
              <i class="layui-icon layui-icon-close"></i>
            </button>
          </div>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">目标描述</span>
              <div class="detail-value">
                <textarea v-if="isEditing" v-model="editForm.description" class="edit-textarea"></textarea>
                <span v-else>{{ selectedGoal?.description || '暂无描述' }}</span>
              </div>
            </div>
            <div class="detail-row">
              <span class="detail-label">截止日期</span>
              <div class="detail-value">
                <input v-if="isEditing" type="date" v-model="editForm.deadline" class="edit-date" />
                <span v-else>{{ selectedGoal?.deadline }}</span>
              </div>
            </div>
          </div>
          <div class="progress-section">
            <div class="progress-header">
              <span>完成进度</span>
              <span>{{ selectedGoal?.progress }}%</span>
            </div>
            <div class="progress-bar-large">
              <div class="progress-fill-large"
                :style="{ width: selectedGoal?.progress + '%', background: getProgressColor(selectedGoal?.progress) }">
              </div>
            </div>
            <div class="progress-controls">
              <button @click="updateProgress(-10)">-10%</button>
              <button @click="updateProgress(10)">+10%</button>
              <button @click="updateProgress(100)">完成</button>
            </div>
          </div>
          <div class="milestone-section">
            <div class="section-header">
              <span class="section-title">里程碑</span>
              <div class="section-header-right">
                <span class="section-count">{{ completedMilestones }}/{{ selectedGoal?.milestones?.length || 0 }}
                  已完成</span>
                <button class="add-milestone-btn" @click="addMilestoneToGoal">
                  <i class="layui-icon layui-icon-add"></i> 添加
                </button>
              </div>
            </div>
            <div class="milestone-list">
              <div v-for="(milestone, index) in selectedGoal?.milestones" :key="index" class="milestone-item"
                :class="{ completed: milestone.completed, editing: editingMilestoneIndex === index }">
                <input type="checkbox" :checked="milestone.completed"
                  @change="toggleMilestone(selectedGoal.id, index)" />
                <div class="milestone-content">
                  <input v-if="editingMilestoneIndex === index" v-model="milestone.title" class="milestone-edit-input"
                    @keyup.enter="saveMilestoneEdit" @keyup.escape="cancelMilestoneEdit" />
                  <div v-else class="milestone-title">{{ milestone.title }}</div>
                  <input v-if="editingMilestoneIndex === index" type="date" v-model="milestone.date"
                    class="milestone-edit-date" />
                  <div v-else class="milestone-date">{{ milestone.date }}</div>
                </div>
                <div class="milestone-actions">
                  <button v-if="editingMilestoneIndex === index" class="milestone-action-btn save"
                    @click="saveMilestoneEdit">
                    <i class="layui-icon layui-icon-save"></i>
                  </button>
                  <button v-if="editingMilestoneIndex === index" class="milestone-action-btn cancel"
                    @click="cancelMilestoneEdit">
                    <i class="layui-icon layui-icon-close"></i>
                  </button>
                  <button v-else class="milestone-action-btn edit" @click="startMilestoneEdit(index)">
                    <i class="layui-icon layui-icon-edit"></i>
                  </button>
                  <button class="milestone-action-btn delete" @click="deleteMilestoneFromGoal(index)">
                    <i class="layui-icon layui-icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="!isEditing" class="btn-secondary" @click="deleteGoal(selectedGoal.id)">删除目标</button>
          <button class="btn-primary" @click="closeGoalDetailModal">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showGoalModal" class="modal-overlay" @click.self="closeGoalModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingGoal ? '编辑目标' : '新建目标' }}</span>
          <button class="modal-close" @click="closeGoalModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>目标标题</label>
            <input type="text" v-model="formData.title" placeholder="请输入目标标题" class="form-input" />
          </div>
          <div class="form-group">
            <label>目标描述</label>
            <textarea v-model="formData.description" placeholder="请输入目标描述" class="form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <select v-model="formData.category" class="form-select">
                <option v-for="cat in goalCategories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>截止日期</label>
              <input type="date" v-model="formData.deadline" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>里程碑</label>
            <div class="milestone-inputs">
              <div v-for="(m, index) in formData.milestones" :key="index" class="milestone-input-row">
                <input type="text" v-model="m.title" placeholder="里程碑 {{ index + 1 }}" class="form-input" />
                <input type="date" v-model="m.date" class="form-input date-input" />
                <button class="remove-milestone" @click="removeMilestone(index)">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </div>
            </div>
            <button class="add-milestone" @click="addMilestone">
              <i class="layui-icon layui-icon-add"></i> 添加里程碑
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeGoalModal">取消</button>
          <button class="btn-confirm" @click="saveGoal">{{ editingGoal ? '保存修改' : '创建目标' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showHabitModal" class="modal-overlay" @click.self="closeHabitModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">添加习惯</span>
          <button class="modal-close" @click="closeHabitModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>习惯名称</label>
            <input type="text" v-model="habitForm.name" placeholder="请输入习惯名称" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>图标</label>
              <select v-model="habitForm.icon" class="form-select">
                <option value="layui-icon layui-icon-sunny">☀️ 太阳</option>
                <option value="layui-icon layui-icon-book">📚 书本</option>
                <option value="layui-icon layui-icon-heart">❤️ 心形</option>
                <option value="layui-icon layui-icon-face-smile">😊 笑脸</option>
                <option value="layui-icon layui-icon-run">🏃 跑步</option>
                <option value="layui-icon layui-icon-music">🎵 音乐</option>
                <option value="layui-icon layui-icon-code">💻 代码</option>
                <option value="layui-icon layui-icon-coffee">☕ 咖啡</option>
              </select>
            </div>
            <div class="form-group">
              <label>颜色</label>
              <select v-model="habitForm.color" class="form-select">
                <option value="#f59e0b">橙色</option>
                <option value="#8b5cf6">紫色</option>
                <option value="#ef4444">红色</option>
                <option value="#10b981">绿色</option>
                <option value="#3b82f6">蓝色</option>
                <option value="#ec4899">粉色</option>
                <option value="#06b6d4">青色</option>
                <option value="#84cc16">黄绿色</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeHabitModal">取消</button>
          <button class="btn-confirm" @click="saveHabit">创建习惯</button>
        </div>
      </div>
    </div>

    <div v-if="showEditHabitModal" class="modal-overlay" @click.self="closeEditHabitModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">编辑习惯</span>
          <button class="modal-close" @click="closeEditHabitModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>习惯名称</label>
            <input type="text" v-model="editHabitForm.name" placeholder="请输入习惯名称" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>图标</label>
              <select v-model="editHabitForm.icon" class="form-select">
                <option value="layui-icon layui-icon-sunny">☀️ 太阳</option>
                <option value="layui-icon layui-icon-book">📚 书本</option>
                <option value="layui-icon layui-icon-heart">❤️ 心形</option>
                <option value="layui-icon layui-icon-face-smile">😊 笑脸</option>
                <option value="layui-icon layui-icon-run">🏃 跑步</option>
                <option value="layui-icon layui-icon-music">🎵 音乐</option>
                <option value="layui-icon layui-icon-code">💻 代码</option>
                <option value="layui-icon layui-icon-coffee">☕ 咖啡</option>
              </select>
            </div>
            <div class="form-group">
              <label>颜色</label>
              <select v-model="editHabitForm.color" class="form-select">
                <option value="#f59e0b">橙色</option>
                <option value="#8b5cf6">紫色</option>
                <option value="#ef4444">红色</option>
                <option value="#10b981">绿色</option>
                <option value="#3b82f6">蓝色</option>
                <option value="#ec4899">粉色</option>
                <option value="#06b6d4">青色</option>
                <option value="#84cc16">黄绿色</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditHabitModal">取消</button>
          <button class="btn-confirm" @click="saveEditHabit">保存修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'
import { dataManager } from '@/utils/dataManager'

const appStore = useAppStore()

const goals = ref([])
const habits = ref([])

const loadData = () => {
  goals.value = dataManager.goals.getAll()
  habits.value = dataManager.habits.getAll()
}

onMounted(() => {
  loadData()
})

const selectedGoal = ref(null)
const showGoalModal = ref(false)
const showGoalDetailModal = ref(false)
const showHabitModal = ref(false)
const editingGoal = ref(null)
const activeFilter = ref('all')

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'work', label: '工作' },
  { value: 'study', label: '学习' },
  { value: 'life', label: '生活' },
  { value: 'fitness', label: '健身' },
  { value: 'finance', label: '财务' }
]

const goalCategories = [
  { value: 'work', label: '工作' },
  { value: 'study', label: '学习' },
  { value: 'life', label: '生活' },
  { value: 'fitness', label: '健身' },
  { value: 'finance', label: '财务' }
]

const formData = reactive({
  title: '',
  description: '',
  category: 'study',
  deadline: '',
  milestones: []
})

const habitForm = reactive({
  name: '',
  icon: 'layui-icon layui-icon-sunny',
  color: '#f59e0b'
})

const showEditHabitModal = ref(false)
const editingHabit = ref(null)
const editHabitForm = reactive({
  id: '',
  name: '',
  icon: 'layui-icon layui-icon-sunny',
  color: '#f59e0b'
})

const isEditing = ref(false)
const editForm = reactive({
  title: '',
  description: '',
  category: 'study',
  deadline: ''
})

const editingMilestoneIndex = ref(-1)
const originalMilestoneData = ref({})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const completedGoals = computed(() => goals.value.filter(g => g.progress === 100).length)

const maxStreak = computed(() => Math.max(...habits.value.map(h => h.streak), 0))

const completedMilestones = computed(() => {
  if (!selectedGoal.value) return 0
  return selectedGoal.value.milestones.filter(m => m.completed).length
})

const filteredGoals = computed(() => {
  if (activeFilter.value === 'all') return goals.value
  return goals.value.filter(g => g.category === activeFilter.value)
})

const getCategoryText = (category) => {
  const cat = goalCategories.find(c => c.value === category)
  return cat ? cat.label : '其他'
}

const getProgressColor = (progress) => {
  if (progress >= 80) return '#10b981'
  if (progress >= 50) return '#3b82f6'
  if (progress >= 25) return '#f59e0b'
  return '#ef4444'
}

const getLast7Days = () => {
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
}

const showGoalDetail = (goal) => {
  selectedGoal.value = goal
  showGoalDetailModal.value = true
}

const closeGoalDetailModal = () => {
  showGoalDetailModal.value = false
  selectedGoal.value = null
}

const toggleHabit = (id) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    const today = new Date().toISOString().split('T')[0]
    if (habit.todayChecked) {
      const index = habit.checkedDays.indexOf(today)
      if (index !== -1) habit.checkedDays.splice(index, 1)
      habit.todayChecked = false
      if (habit.streak > 0) habit.streak--
    } else {
      habit.checkedDays.push(today)
      habit.todayChecked = true
      habit.streak++
      layer.msg('打卡成功！连续 ' + habit.streak + ' 天', { icon: 1 })
    }
    dataManager.habits.update(habit)
    loadData()
  }
}

const updateProgress = (delta) => {
  if (selectedGoal.value) {
    let newProgress = selectedGoal.value.progress + delta
    if (newProgress < 0) newProgress = 0
    if (newProgress > 100) newProgress = 100
    selectedGoal.value.progress = newProgress
    dataManager.goals.update(selectedGoal.value)
    loadData()
    if (newProgress === 100) {
      layer.msg('恭喜！目标已完成！', { icon: 6 })
    }
  }
}

const toggleMilestone = (goalId, index) => {
  const goal = goals.value.find(g => g.id === goalId)
  if (goal && goal.milestones[index]) {
    goal.milestones[index].completed = !goal.milestones[index].completed
    const total = goal.milestones.length
    const completed = goal.milestones.filter(m => m.completed).length
    goal.progress = total > 0 ? Math.round((completed / total) * 100) : 0
    dataManager.goals.update(goal)
    loadData()
    if (goal.progress === 100) {
      layer.msg('恭喜！目标已完成！', { icon: 6 })
    }
  }
}

const addMilestoneToGoal = () => {
  if (selectedGoal.value) {
    selectedGoal.value.milestones.push({ title: '', date: '', completed: false })
    editingMilestoneIndex.value = selectedGoal.value.milestones.length - 1
  }
}

const startMilestoneEdit = (index) => {
  if (selectedGoal.value && selectedGoal.value.milestones[index]) {
    originalMilestoneData.value = {
      title: selectedGoal.value.milestones[index].title,
      date: selectedGoal.value.milestones[index].date
    }
    editingMilestoneIndex.value = index
  }
}

const saveMilestoneEdit = () => {
  if (selectedGoal.value && editingMilestoneIndex.value >= 0) {
    const milestone = selectedGoal.value.milestones[editingMilestoneIndex.value]
    if (!milestone.title.trim()) {
      layer.msg('请输入里程碑标题', { icon: 5 })
      return
    }
    editingMilestoneIndex.value = -1
    const total = selectedGoal.value.milestones.length
    const completed = selectedGoal.value.milestones.filter(m => m.completed).length
    selectedGoal.value.progress = total > 0 ? Math.round((completed / total) * 100) : 0
    dataManager.goals.update(selectedGoal.value)
    loadData()
  }
}

const cancelMilestoneEdit = () => {
  if (selectedGoal.value && editingMilestoneIndex.value >= 0) {
    const milestone = selectedGoal.value.milestones[editingMilestoneIndex.value]
    milestone.title = originalMilestoneData.value.title
    milestone.date = originalMilestoneData.value.date
    editingMilestoneIndex.value = -1
  }
}

const deleteMilestoneFromGoal = (index) => {
  if (selectedGoal.value) {
    selectedGoal.value.milestones.splice(index, 1)
    editingMilestoneIndex.value = -1
    const total = selectedGoal.value.milestones.length
    const completed = selectedGoal.value.milestones.filter(m => m.completed).length
    selectedGoal.value.progress = total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

const startDetailEdit = () => {
  if (selectedGoal.value) {
    editForm.title = selectedGoal.value.title
    editForm.description = selectedGoal.value.description || ''
    editForm.category = selectedGoal.value.category
    editForm.deadline = selectedGoal.value.deadline || ''
    isEditing.value = true
  }
}

const saveDetailEdit = () => {
  if (selectedGoal.value && editForm.title.trim()) {
    selectedGoal.value.title = editForm.title.trim()
    selectedGoal.value.description = editForm.description.trim()
    selectedGoal.value.category = editForm.category
    selectedGoal.value.deadline = editForm.deadline
    isEditing.value = false
    layer.msg('修改成功！', { icon: 6 })
  } else {
    layer.msg('请输入目标标题', { icon: 5 })
  }
}

const cancelDetailEdit = () => {
  isEditing.value = false
}

const addMilestone = () => {
  formData.milestones.push({ title: '', date: '', completed: false })
}

const removeMilestone = (index) => {
  formData.milestones.splice(index, 1)
}

const editGoal = (goal) => {
  editingGoal.value = { ...goal }
  formData.title = goal.title
  formData.description = goal.description || ''
  formData.category = goal.category
  formData.deadline = goal.deadline || ''
  formData.milestones = goal.milestones ? [...goal.milestones] : []
  showGoalDetailModal.value = false
  showGoalModal.value = true
}

const closeGoalModal = () => {
  showGoalModal.value = false
  editingGoal.value = null
  formData.title = ''
  formData.description = ''
  formData.category = 'study'
  formData.deadline = ''
  formData.milestones = []
}

const saveGoal = () => {
  if (!formData.title.trim()) {
    layer.msg('请输入目标标题', { icon: 5 })
    return
  }
  if (editingGoal.value) {
    dataManager.goals.update({
      ...formData,
      id: editingGoal.value.id,
      progress: editingGoal.value.progress
    })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.goals.add({
      ...formData,
      progress: 0
    })
    layer.msg('创建成功', { icon: 1 })
  }
  loadData()
  closeGoalModal()
}

const deleteGoal = (id) => {
  if (confirm('确定删除该目标吗？')) {
    const success = dataManager.goals.delete(id)
    if (success) {
      goals.value = goals.value.filter(g => String(g.id) !== String(id))
      layer.msg('删除成功', { icon: 1 })
    } else {
      layer.msg('删除失败', { icon: 5 })
    }
  }
}

const closeHabitModal = () => {
  showHabitModal.value = false
  habitForm.name = ''
  habitForm.icon = 'layui-icon layui-icon-sunny'
  habitForm.color = '#f59e0b'
}

const saveHabit = () => {
  if (!habitForm.name.trim()) {
    layer.msg('请输入习惯名称', { icon: 5 })
    return
  }
  dataManager.habits.add({
    name: habitForm.name.trim(),
    icon: habitForm.icon,
    color: habitForm.color
  })
  layer.msg('创建成功', { icon: 1 })
  loadData()
  closeHabitModal()
}

const editHabit = (habit) => {
  editingHabit.value = habit
  editHabitForm.id = habit.id
  editHabitForm.name = habit.name
  editHabitForm.icon = habit.icon
  editHabitForm.color = habit.color
  showEditHabitModal.value = true
}

const closeEditHabitModal = () => {
  showEditHabitModal.value = false
  editingHabit.value = null
  editHabitForm.id = ''
  editHabitForm.name = ''
  editHabitForm.icon = 'layui-icon layui-icon-sunny'
  editHabitForm.color = '#f59e0b'
}

const saveEditHabit = () => {
  if (!editHabitForm.name.trim()) {
    layer.msg('请输入习惯名称', { icon: 5 })
    return
  }
  dataManager.habits.update({
    id: editHabitForm.id,
    name: editHabitForm.name.trim(),
    icon: editHabitForm.icon,
    color: editHabitForm.color,
    streak: editingHabit.value.streak,
    todayChecked: editingHabit.value.todayChecked,
    checkedDays: editingHabit.value.checkedDays
  })
  layer.msg('修改成功', { icon: 1 })
  loadData()
  closeEditHabitModal()
}

const deleteHabit = (id) => {
  if (confirm('确定删除该习惯吗？')) {
    const success = dataManager.habits.delete(id)
    if (success) {
      habits.value = habits.value.filter(h => String(h.id) !== String(id))
      layer.msg('删除成功', { icon: 1 })
    } else {
      layer.msg('删除失败', { icon: 5 })
    }
  }
}

const addHabitToTodo = (habit) => {
  dataManager.todos.add({
    title: habit.name,
    category: 'life',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    description: `习惯打卡: ${habit.name}`,
    quadrant: 'important-not-urgent',
    status: 'pending',
    habitId: habit.id
  })
  layer.msg('已添加到待办事项', { icon: 1 })
}
</script>

<style scoped>
.goals-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
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
  transition: all 0.25s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
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
  font-size: 24px;
  color: #fff;
}

.stat-icon.goals {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.habits {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.streak {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #334155;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 16px;
  background: #f8fafc;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: #f1f5f9;
}

.filter-tab.active {
  background: var(--primary-color, #1e4d7b);
  color: #fff;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.goal-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.goal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.goal-category {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.goal-category.work {
  background: #dbeafe;
  color: #2563eb;
}

.goal-category.study {
  background: #ede9fe;
  color: #7c3aed;
}

.goal-category.life {
  background: #fef3c7;
  color: #d97706;
}

.goal-category.fitness {
  background: #fee2e2;
  color: #dc2626;
}

.goal-category.finance {
  background: #dcfce7;
  color: #16a34a;
}

.goal-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 6px;
  background: #f8fafc;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.goal-card:hover .action-btn {
  opacity: 1;
}

.action-btn.edit {
  color: #64748b;
}

.action-btn.edit:hover {
  background: #f1f5f9;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.goal-card-body {
  margin-bottom: 16px;
}

.goal-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.goal-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goal-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-ring {
  position: relative;
  width: 50px;
  height: 50px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.progress-info {
  flex: 1;
}

.progress-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.deadline-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.milestone-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.milestone-label {
  font-size: 12px;
  color: #94a3b8;
}

.milestone-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.milestone-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
}

.milestone-dot.completed {
  background: #10b981;
}

.milestone-more {
  font-size: 11px;
  color: #94a3b8;
}

.add-habit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}

.add-habit-btn:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 5%, white);
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.habits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.habit-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.habit-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
}

.habit-info {
  flex: 1;
}

.habit-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.habit-streak {
  font-size: 12px;
  color: #f59e0b;
}

.check-btn {
  width: 38px;
  height: 38px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.25s ease;
}

.check-btn.checked {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.habit-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.habit-action-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.habit-action-btn:hover {
  background: #e2e8f0;
}

.habit-action-btn.add-todo {
  color: #3b82f6;
}

.habit-action-btn.add-todo:hover {
  background: #dbeafe;
}

.habit-action-btn.edit {
  color: #f59e0b;
}

.habit-action-btn.edit:hover {
  background: #fef3c7;
}

.habit-action-btn.delete {
  color: #ef4444;
}

.habit-action-btn.delete:hover {
  background: #fee2e2;
}

.habit-calendar {
  display: flex;
  justify-content: space-between;
}

.calendar-day {
  width: 36px;
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 11px;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.calendar-day.checked {
  background: #10b981;
  color: #fff;
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
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-actions .edit-btn,
.modal-actions .save-btn,
.modal-actions .cancel-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-actions .edit-btn {
  background: #f1f5f9;
  color: #64748b;
}

.modal-actions .edit-btn:hover {
  background: #e2e8f0;
}

.modal-actions .save-btn {
  background: #3b82f6;
  color: #fff;
}

.modal-actions .save-btn:hover {
  background: #2563eb;
}

.modal-actions .cancel-btn {
  background: #fef2f2;
  color: #ef4444;
}

.modal-actions .cancel-btn:hover {
  background: #fee2e2;
}

.category-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
}

.title-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  width: 200px;
}

.edit-textarea {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  width: 100%;
  min-height: 80px;
  resize: vertical;
}

.edit-date {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
}

.goal-category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.goal-category-badge.work {
  background: #dbeafe;
  color: #2563eb;
}

.goal-category-badge.study {
  background: #ede9fe;
  color: #7c3aed;
}

.goal-category-badge.life {
  background: #fef3c7;
  color: #d97706;
}

.goal-category-badge.fitness {
  background: #fee2e2;
  color: #dc2626;
}

.goal-category-badge.finance {
  background: #dcfce7;
  color: #16a34a;
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
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.progress-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 12px;
}

.progress-bar-large {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill-large {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-controls {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.progress-controls button {
  flex: 1;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.progress-controls button:hover {
  background: #f8fafc;
}

.milestone-section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.section-count {
  font-size: 13px;
  color: #10b981;
  font-weight: 500;
}

.section-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-milestone-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-milestone-btn:hover {
  background: #2563eb;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.milestone-item.completed {
  opacity: 0.6;
}

.milestone-item.completed .milestone-title {
  text-decoration: line-through;
}

.milestone-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.milestone-edit-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #334155;
}

.milestone-edit-date {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  color: #334155;
}

.milestone-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.milestone-action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.milestone-action-btn.edit {
  background: #f1f5f9;
  color: #64748b;
}

.milestone-action-btn.edit:hover {
  background: #e2e8f0;
}

.milestone-action-btn.save {
  background: #10b981;
  color: #fff;
}

.milestone-action-btn.save:hover {
  background: #059669;
}

.milestone-action-btn.cancel {
  background: #fef2f2;
  color: #ef4444;
}

.milestone-action-btn.cancel:hover {
  background: #fee2e2;
}

.milestone-action-btn.delete {
  background: #fef2f2;
  color: #ef4444;
}

.milestone-action-btn.delete:hover {
  background: #fee2e2;
}

.milestone-content {
  flex: 1;
}

.milestone-title {
  font-size: 14px;
  color: #334155;
}

.milestone-date {
  font-size: 12px;
  color: #94a3b8;
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

.btn-secondary {
  padding: 10px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.btn-primary {
  padding: 10px 20px;
  background: var(--primary-color, #1e4d7b);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  outline: none;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.milestone-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.milestone-input-row {
  display: flex;
  gap: 8px;
}

.milestone-input-row .form-input {
  flex: 1;
}

.date-input {
  width: 120px;
}

.remove-milestone {
  padding: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
}

.remove-milestone:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #ef4444;
}

.add-milestone {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}

.add-milestone:hover {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 5%, white);
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

@media (max-width: 1200px) {
  .goals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .goals-grid {
    grid-template-columns: 1fr;
  }

  .habits-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }

  .modal-content.large {
    width: 90%;
  }
}
</style>