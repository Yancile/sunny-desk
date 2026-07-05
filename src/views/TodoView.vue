<template>
  <div class="todo-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">待办事项</h1>
        <p class="page-desc">管理您的日常任务，提高工作效率</p>
      </div>
    </div>

    <div class="quick-add-section">
      <input type="text" v-model="quickAddText" @keyup.enter="quickAddTask" placeholder="输入任务内容"
        class="quick-add-input" />
      <button class="quick-add-btn" @click="quickAddTask">
        <span class="btn-plus">+</span> 新增任务
      </button>
    </div>

    <div class="action-buttons">
      <button class="action-btn" @click="exportTasks">
        <i class="layui-icon layui-icon-download"></i> 导出任务列表
      </button>
      <button class="action-btn" @click="clearAllTasks">
        <i class="layui-icon layui-icon-delete"></i> 清空所有任务
      </button>
      <button class="action-btn" @click="generateReport">
        <i class="layui-icon layui-icon-file"></i> 生成任务报告
      </button>
    </div>

    <div class="quadrant-grid">
      <div class="quadrant important-not-urgent">
        <div class="quadrant-header">
          <span class="quadrant-title">重要而不紧急</span>
          <span class="quadrant-count">({{getQuadrantTasks(false, true).filter(t => t.status !== 'completed').length
            }}/{{ getQuadrantTasks(false, true).length }})</span>
          <div class="hide-completed">
            <button class="hide-btn" @click="toggleHideCompleted('important-not-urgent')">
              {{ hideCompleted['important-not-urgent'] ? '显示完成' : '隐藏完成' }}
              <i class="layui-icon layui-icon-down"></i>
            </button>
          </div>
        </div>
        <div class="task-items">
          <div v-for="task in getFilteredQuadrantTasks(false, true)" :key="task.id" class="task-item">
            <input type="checkbox" :checked="task.status === 'completed'" @change="toggleTaskStatus(task.id)"
              class="task-checkbox" />
            <template v-if="editingId !== task.id">
              <span class="task-text" :class="{ completed: task.status === 'completed' }">{{ task.title }}</span>
              <span class="quadrant-badge" :class="task.quadrant">{{ getQuadrantText(task.quadrant) }}</span>
              <div class="task-actions">
                <button class="edit-btn" @click="startEdit(task)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteTask(task.id)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </div>
            </template>
            <template v-else>
              <input type="text" v-model="editData.title" class="edit-title-input" @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit" />
              <select v-model="editData.quadrant" class="edit-quadrant-select">
                <option v-for="q in quadrants" :key="q.value" :value="q.value">{{ q.label }}</option>
              </select>
              <div class="task-actions">
                <button class="save-btn" @click="saveEdit">
                  <i class="layui-icon layui-icon-save"></i>
                </button>
                <button class="cancel-btn" @click="cancelEdit">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </div>
            </template>
          </div>
          <div v-if="getFilteredQuadrantTasks(false, true).length === 0" class="empty-tip">
            <span
              v-if="getQuadrantTasks(false, true).length > 0 && hideCompleted['important-not-urgent']">已隐藏所有完成任务</span>
            <span v-else>暂无任务</span>
          </div>
          <div v-if="isAllCompleted(false, true)" class="all-completed">🎉 全部完成!</div>
        </div>
      </div>

      <div class="quadrant important-urgent">
        <div class="quadrant-header">
          <span class="quadrant-title">重要而紧急</span>
          <span class="quadrant-count">({{getQuadrantTasks(true, true).filter(t => t.status !== 'completed').length
            }}/{{ getQuadrantTasks(true, true).length }})</span>
          <div class="hide-completed">
            <button class="hide-btn" @click="toggleHideCompleted('important-urgent')">
              {{ hideCompleted['important-urgent'] ? '显示完成' : '隐藏完成' }}
              <i class="layui-icon layui-icon-down"></i>
            </button>
          </div>
        </div>
        <div class="task-items">
          <div v-for="task in getFilteredQuadrantTasks(true, true)" :key="task.id" class="task-item">
            <input type="checkbox" :checked="task.status === 'completed'" @change="toggleTaskStatus(task.id)"
              class="task-checkbox" />
            <template v-if="editingId !== task.id">
              <span class="task-text" :class="{ completed: task.status === 'completed' }">{{ task.title }}</span>
              <span class="quadrant-badge" :class="task.quadrant">{{ getQuadrantText(task.quadrant) }}</span>
              <div class="task-actions">
                <button class="edit-btn" @click="startEdit(task)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteTask(task.id)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </div>
            </template>
            <template v-else>
              <input type="text" v-model="editData.title" class="edit-title-input" @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit" />
              <select v-model="editData.quadrant" class="edit-quadrant-select">
                <option v-for="q in quadrants" :key="q.value" :value="q.value">{{ q.label }}</option>
              </select>
              <div class="task-actions">
                <button class="save-btn" @click="saveEdit">
                  <i class="layui-icon layui-icon-save"></i>
                </button>
                <button class="cancel-btn" @click="cancelEdit">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </div>
            </template>
          </div>
          <div v-if="getFilteredQuadrantTasks(true, true).length === 0" class="empty-tip">
            <span v-if="getQuadrantTasks(true, true).length > 0 && hideCompleted['important-urgent']">已隐藏所有完成任务</span>
            <span v-else>暂无任务</span>
          </div>
          <div v-if="isAllCompleted(true, true)" class="all-completed">🎉 全部完成!</div>
        </div>
      </div>

      <div class="quadrant not-important-not-urgent">
        <div class="quadrant-header">
          <span class="quadrant-title">不重要而不紧急</span>
          <span class="quadrant-count">({{getQuadrantTasks(false, false).filter(t => t.status !== 'completed').length
            }}/{{ getQuadrantTasks(false, false).length }})</span>
          <div class="hide-completed">
            <button class="hide-btn" @click="toggleHideCompleted('not-important-not-urgent')">
              {{ hideCompleted['not-important-not-urgent'] ? '显示完成' : '隐藏完成' }}
              <i class="layui-icon layui-icon-down"></i>
            </button>
          </div>
        </div>
        <div class="task-items">
          <div v-for="task in getFilteredQuadrantTasks(false, false)" :key="task.id" class="task-item">
            <input type="checkbox" :checked="task.status === 'completed'" @change="toggleTaskStatus(task.id)"
              class="task-checkbox" />
            <template v-if="editingId !== task.id">
              <span class="task-text" :class="{ completed: task.status === 'completed' }">{{ task.title }}</span>
              <span class="quadrant-badge" :class="task.quadrant">{{ getQuadrantText(task.quadrant) }}</span>
              <div class="task-actions">
                <button class="edit-btn" @click="startEdit(task)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteTask(task.id)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </div>
            </template>
            <template v-else>
              <input type="text" v-model="editData.title" class="edit-title-input" @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit" />
              <select v-model="editData.quadrant" class="edit-quadrant-select">
                <option v-for="q in quadrants" :key="q.value" :value="q.value">{{ q.label }}</option>
              </select>
              <div class="task-actions">
                <button class="save-btn" @click="saveEdit">
                  <i class="layui-icon layui-icon-save"></i>
                </button>
                <button class="cancel-btn" @click="cancelEdit">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </div>
            </template>
          </div>
          <div v-if="getFilteredQuadrantTasks(false, false).length === 0" class="empty-tip">
            <span
              v-if="getQuadrantTasks(false, false).length > 0 && hideCompleted['not-important-not-urgent']">已隐藏所有完成任务</span>
            <span v-else>暂无任务</span>
          </div>
          <div v-if="isAllCompleted(false, false)" class="all-completed">🎉 全部完成!</div>
        </div>
      </div>

      <div class="quadrant not-important-urgent">
        <div class="quadrant-header">
          <span class="quadrant-title">不重要而紧急</span>
          <span class="quadrant-count">({{getQuadrantTasks(true, false).filter(t => t.status !== 'completed').length
            }}/{{ getQuadrantTasks(true, false).length }})</span>
          <div class="hide-completed">
            <button class="hide-btn" @click="toggleHideCompleted('not-important-urgent')">
              {{ hideCompleted['not-important-urgent'] ? '显示完成' : '隐藏完成' }}
              <i class="layui-icon layui-icon-down"></i>
            </button>
          </div>
        </div>
        <div class="task-items">
          <div v-for="task in getFilteredQuadrantTasks(true, false)" :key="task.id" class="task-item">
            <input type="checkbox" :checked="task.status === 'completed'" @change="toggleTaskStatus(task.id)"
              class="task-checkbox" />
            <template v-if="editingId !== task.id">
              <span class="task-text" :class="{ completed: task.status === 'completed' }">{{ task.title }}</span>
              <span class="quadrant-badge" :class="task.quadrant">{{ getQuadrantText(task.quadrant) }}</span>
              <div class="task-actions">
                <button class="edit-btn" @click="startEdit(task)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteTask(task.id)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </div>
            </template>
            <template v-else>
              <input type="text" v-model="editData.title" class="edit-title-input" @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit" />
              <select v-model="editData.quadrant" class="edit-quadrant-select">
                <option v-for="q in quadrants" :key="q.value" :value="q.value">{{ q.label }}</option>
              </select>
              <div class="task-actions">
                <button class="save-btn" @click="saveEdit">
                  <i class="layui-icon layui-icon-save"></i>
                </button>
                <button class="cancel-btn" @click="cancelEdit">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </div>
            </template>
          </div>
          <div v-if="getFilteredQuadrantTasks(true, false).length === 0" class="empty-tip">
            <span
              v-if="getQuadrantTasks(true, false).length > 0 && hideCompleted['not-important-urgent']">已隐藏所有完成任务</span>
            <span v-else>暂无任务</span>
          </div>
          <div v-if="isAllCompleted(true, false)" class="all-completed">🎉 全部完成!</div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingTask ? '编辑任务' : '添加任务' }}</span>
          <button class="modal-close" @click="closeModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>任务标题</label>
            <input type="text" v-model="formData.title" placeholder="请输入任务标题" class="form-input" />
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea v-model="formData.description" placeholder="请输入任务描述" class="form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>优先级</label>
              <select v-model="formData.priority" class="form-select">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="formData.category" class="form-select">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>截止日期</label>
              <input type="datetime-local" v-model="formData.deadline" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="saveTask">{{ editingTask ? '保存修改' : '添加任务' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { dataManager } from '@/utils/dataManager'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()

const quickAddText = ref('')
const showAddModal = ref(false)
const editingTask = ref(null)
const editingId = ref(null)
const editData = reactive({ title: '', quadrant: 'important-not-urgent' })
const tasks = ref([])

const quadrants = [
  { value: 'important-not-urgent', label: '重要而不紧急' },
  { value: 'important-urgent', label: '重要而紧急' },
  { value: 'not-important-not-urgent', label: '不重要而不紧急' },
  { value: 'not-important-urgent', label: '不重要而紧急' }
]

const hideCompleted = reactive({
  'important-not-urgent': false,
  'important-urgent': false,
  'not-important-not-urgent': false,
  'not-important-urgent': false
})

const categories = [
  { value: 'work', label: '工作' },
  { value: 'study', label: '学习' },
  { value: 'life', label: '生活' },
  { value: 'fitness', label: '健身' },
  { value: 'other', label: '其他' }
]

const formData = reactive({
  title: '',
  description: '',
  priority: 'medium',
  category: 'work',
  deadline: ''
})

const themeStyle = ref({})

const loadTasks = () => {
  tasks.value = dataManager.todos.getAll()
}

const getQuadrantKey = (urgent, important) => {
  return urgent ? (important ? 'important-urgent' : 'not-important-urgent') : (important ? 'important-not-urgent' : 'not-important-not-urgent')
}

const getQuadrantTasks = (urgent, important) => {
  const quadrantKey = getQuadrantKey(urgent, important)
  return tasks.value.filter(task => task.quadrant === quadrantKey)
}

const getFilteredQuadrantTasks = (urgent, important) => {
  const quadrantKey = urgent ? (important ? 'important-urgent' : 'not-important-urgent') : (important ? 'important-not-urgent' : 'not-important-not-urgent')
  return getQuadrantTasks(urgent, important).filter(task => {
    if (hideCompleted[quadrantKey]) {
      return task.status !== 'completed'
    }
    return true
  })
}

const isAllCompleted = (urgent, important) => {
  const quadrantTasks = getQuadrantTasks(urgent, important)
  if (quadrantTasks.length === 0) return false
  return quadrantTasks.every(t => t.status === 'completed')
}

const toggleHideCompleted = (key) => {
  hideCompleted[key] = !hideCompleted[key]
}

const toggleTaskStatus = (id) => {
  const newStatus = dataManager.todos.toggleStatus(id)
  loadTasks()
  if (newStatus === 'completed') {
    layer.msg('任务已完成', { icon: 1 })
  }
}

const quickAddTask = () => {
  if (!quickAddText.value.trim()) return
  dataManager.todos.add({
    title: quickAddText.value.trim(),
    description: '',
    quadrant: 'important-not-urgent',
    status: 'pending',
    deadline: '',
    priority: 'medium',
    category: 'work'
  })
  quickAddText.value = ''
  loadTasks()
  layer.msg('添加成功', { icon: 1 })
}

const getQuadrantText = (quadrant) => {
  const map = {
    'important-not-urgent': '重要而不紧急',
    'important-urgent': '重要而紧急',
    'not-important-not-urgent': '不重要而不紧急',
    'not-important-urgent': '不重要而紧急'
  }
  return map[quadrant] || '重要而不紧急'
}

const startEdit = (task) => {
  editingId.value = task.id
  editData.title = task.title
  editData.quadrant = task.quadrant
}

const saveEdit = () => {
  if (!editData.title.trim()) {
    layer.msg('请输入任务名称', { icon: 5 })
    return
  }
  dataManager.todos.update({
    id: editingId.value,
    title: editData.title.trim(),
    quadrant: editData.quadrant
  })
  loadTasks()
  layer.msg('修改成功', { icon: 1 })
  editingId.value = null
}

const cancelEdit = () => {
  editingId.value = null
}

const closeModal = () => {
  showAddModal.value = false
  editingTask.value = null
  formData.title = ''
  formData.description = ''
  formData.priority = 'medium'
  formData.category = 'work'
  formData.deadline = ''
}

const saveTask = () => {
  if (!formData.title.trim()) {
    layer.msg('请输入任务标题', { icon: 5 })
    return
  }
  if (editingTask.value) {
    dataManager.todos.update({
      ...formData,
      id: editingTask.value.id
    })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.todos.add({
      ...formData,
      status: 'pending',
      quadrant: 'important-not-urgent'
    })
    layer.msg('添加成功', { icon: 1 })
  }
  loadTasks()
  closeModal()
}

const deleteTask = (id) => {
  layer.confirm('确定删除该任务吗？', { icon: 3 }, () => {
    dataManager.todos.delete(id)
    loadTasks()
    layer.msg('删除成功', { icon: 1 })
  })
}

const exportTasks = () => {
  const data = tasks.value.map(t => ({
    title: t.title,
    status: t.status === 'completed' ? '已完成' : '待办',
    priority: t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低',
    category: categories.find(c => c.value === t.category)?.label || '其他'
  }))
  const csv = ['标题,状态,优先级,分类'].concat(data.map(d => `${d.title},${d.status},${d.priority},${d.category}`)).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tasks.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  layer.msg('导出成功', { icon: 1 })
}

const clearAllTasks = () => {
  layer.confirm('确定清空所有任务吗？此操作不可恢复。', { icon: 3 }, () => {
    dataManager.todos.clearAll()
    loadTasks()
    layer.msg('已清空所有任务', { icon: 1 })
  })
}

const generateReport = () => {
  const total = tasks.value.length
  const completed = tasks.value.filter(t => t.status === 'completed').length
  const pending = tasks.value.filter(t => t.status !== 'completed').length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const report = `任务报告\n\n总任务数: ${total}\n已完成: ${completed}\n待办: ${pending}\n完成率: ${rate}%\n\n生成时间: ${new Date().toLocaleString()}`
  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'task-report.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  layer.msg('报告已生成', { icon: 1 })
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.todo-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
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

.quick-add-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.quick-add-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.quick-add-input:focus {
  border-color: #3b82f6;
}

.quick-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-add-btn:hover {
  background: #333;
}

.btn-plus {
  font-size: 18px;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #333;
}

.quadrant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.quadrant {
  border-radius: 16px;
  padding: 20px;
  min-height: 200px;
}

.quadrant.important-not-urgent {
  background: #fffbeb;
}

.quadrant.important-urgent {
  background: #fce7f3;
}

.quadrant.not-important-not-urgent {
  background: #dbeafe;
}

.quadrant.not-important-urgent {
  background: #dcfce7;
}

.quadrant-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.quadrant-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.quadrant-count {
  font-size: 14px;
  color: #64748b;
}

.hide-completed {
  margin-left: auto;
}

.hide-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hide-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #334155;
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: #f8fafc;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #10b981;
}

.task-text {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.task-text.completed {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-actions {
  display: flex;
  gap: 6px;
}

.edit-btn,
.delete-btn {
  padding: 5px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #3b82f6;
}

.edit-btn:hover {
  background: #eff6ff;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: #fef2f2;
}

.quadrant-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.quadrant-badge.important-not-urgent {
  background: #fef3c7;
  color: #d97706;
}

.quadrant-badge.important-urgent {
  background: #fee2e2;
  color: #dc2626;
}

.quadrant-badge.not-important-not-urgent {
  background: #dbeafe;
  color: #2563eb;
}

.quadrant-badge.not-important-urgent {
  background: #dcfce7;
  color: #16a34a;
}

.edit-title-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.edit-quadrant-select {
  padding: 6px 8px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: #fff;
}

.save-btn {
  padding: 5px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #10b981;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #dcfce7;
}

.cancel-btn {
  padding: 5px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f1f5f9;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
}

.all-completed {
  text-align: center;
  padding: 16px;
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
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
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 480px;
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
  padding: 24px;
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
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
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
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.btn-confirm {
  padding: 10px 20px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

.btn-confirm:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .quadrant-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }
}
</style>