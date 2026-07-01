<template>
  <div class="memo-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">备忘录</h1>
        <p class="page-desc">快速记录，随时查看</p>
      </div>
      <button class="add-btn" @click="showAddModal = true">
        <i class="layui-icon layui-icon-add-circle"></i>
        新建备忘录
      </button>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="layui-icon layui-icon-search"></i>
        <input type="text" v-model="searchKeyword" placeholder="搜索备忘录..." />
      </div>
      <div class="filter-group">
        <select v-model="colorFilter" class="filter-select">
          <option value="">全部颜色</option>
          <option value="yellow">黄色</option>
          <option value="blue">蓝色</option>
          <option value="green">绿色</option>
          <option value="pink">粉色</option>
          <option value="purple">紫色</option>
        </select>
        <button class="filter-btn" :class="{ active: showArchived }" @click="showArchived = !showArchived">
          {{ showArchived ? '显示正常' : '显示归档' }}
        </button>
      </div>
    </div>

    <div class="memo-grid">
      <div v-for="memo in filteredMemos" :key="memo.id" class="memo-card" :class="[memo.color, { pinned: memo.pinned }]" @click="editMemo(memo)">
        <div v-if="memo.pinned" class="pin-icon">
          <i class="layui-icon layui-icon-pin"></i>
        </div>
        <div class="memo-header">
          <h3 class="memo-title">{{ memo.title }}</h3>
          <button class="delete-btn" @click.stop="deleteMemo(memo.id)">
            <i class="layui-icon layui-icon-delete"></i>
          </button>
        </div>
        <p class="memo-content">{{ memo.content }}</p>
        <div class="memo-footer">
          <span class="memo-time">{{ formatTime(memo.createdAt) }}</span>
          <div v-if="memo.reminder" class="reminder-tag">
            <i class="layui-icon layui-icon-clock"></i>
            {{ memo.reminder }}
          </div>
        </div>
      </div>
      <div v-if="filteredMemos.length === 0" class="empty-state">
        <i class="layui-icon layui-icon-note"></i>
        <span>{{ showArchived ? '暂无归档备忘录' : '暂无备忘录，点击上方按钮创建' }}</span>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingMemo ? '编辑备忘录' : '新建备忘录' }}</span>
          <button class="modal-close" @click="closeModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="formData.title" placeholder="请输入标题" class="form-input" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="formData.content" placeholder="请输入内容" class="form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>颜色</label>
              <div class="color-picker">
                <button v-for="color in colors" :key="color.value" class="color-btn" :class="{ active: formData.color === color.value }"
                  :style="{ background: color.bg }" @click="formData.color = color.value"></button>
              </div>
            </div>
            <div class="form-group">
              <label>提醒时间</label>
              <input type="datetime-local" v-model="formData.reminder" class="form-input" />
            </div>
          </div>
          <div class="form-group checkbox-group">
            <input type="checkbox" v-model="formData.pinned" id="pinned" />
            <label for="pinned">置顶显示</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="saveMemo">{{ editingMemo ? '保存修改' : '创建备忘录' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()

const memos = ref([
  {
    id: 1,
    title: '会议记录',
    content: '今天下午的项目会议讨论了Q3的工作计划，需要完成以下任务：1. 需求文档编写 2. 技术方案设计 3. 资源协调',
    color: 'yellow',
    pinned: true,
    reminder: '',
    createdAt: '2026-07-01T14:30',
    archived: false
  },
  {
    id: 2,
    title: '购物清单',
    content: '牛奶、面包、鸡蛋、水果、蔬菜',
    color: 'green',
    pinned: false,
    reminder: '2026-07-02T18:00',
    createdAt: '2026-07-01T10:00',
    archived: false
  },
  {
    id: 3,
    title: '学习笔记',
    content: 'Vue3 Composition API的核心概念：ref、reactive、computed、watch、生命周期钩子',
    color: 'blue',
    pinned: false,
    reminder: '',
    createdAt: '2026-06-30T20:00',
    archived: false
  },
  {
    id: 4,
    title: '重要提醒',
    content: '明天上午9点有客户电话会议，准备好演示材料',
    color: 'pink',
    pinned: true,
    reminder: '2026-07-02T08:30',
    createdAt: '2026-07-01T16:00',
    archived: false
  },
  {
    id: 5,
    title: '阅读推荐',
    content: '《深入理解计算机系统》《代码大全》《设计模式》',
    color: 'purple',
    pinned: false,
    reminder: '',
    createdAt: '2026-06-29T15:00',
    archived: true
  }
])

const searchKeyword = ref('')
const colorFilter = ref('')
const showArchived = ref(false)
const showAddModal = ref(false)
const editingMemo = ref(null)

const colors = [
  { value: 'yellow', bg: '#fef3c7' },
  { value: 'blue', bg: '#dbeafe' },
  { value: 'green', bg: '#dcfce7' },
  { value: 'pink', bg: '#fce7f3' },
  { value: 'purple', bg: '#f3e8ff' }
]

const formData = reactive({
  title: '',
  content: '',
  color: 'yellow',
  reminder: '',
  pinned: false
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const filteredMemos = computed(() => {
  return memos.value.filter(memo => {
    const matchKeyword = !searchKeyword.value || memo.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) || memo.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchColor = !colorFilter.value || memo.color === colorFilter.value
    const matchArchived = memo.archived === showArchived.value
    return matchKeyword && matchColor && matchArchived
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const editMemo = (memo) => {
  editingMemo.value = { ...memo }
  formData.title = memo.title
  formData.content = memo.content
  formData.color = memo.color
  formData.reminder = memo.reminder || ''
  formData.pinned = memo.pinned
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingMemo.value = null
  formData.title = ''
  formData.content = ''
  formData.color = 'yellow'
  formData.reminder = ''
  formData.pinned = false
}

const saveMemo = () => {
  if (!formData.title.trim() && !formData.content.trim()) {
    layer.msg('请输入标题或内容', { icon: 5 })
    return
  }
  if (editingMemo.value) {
    const index = memos.value.findIndex(m => m.id === editingMemo.value.id)
    if (index !== -1) {
      memos.value[index] = { ...formData, id: editingMemo.value.id, createdAt: editingMemo.value.createdAt, archived: editingMemo.value.archived }
      layer.msg('修改成功', { icon: 1 })
    }
  } else {
    memos.value.unshift({
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      archived: false
    })
    layer.msg('创建成功', { icon: 1 })
  }
  closeModal()
}

const deleteMemo = (id) => {
  layer.confirm('确定删除该备忘录吗？', { icon: 3 }, () => {
    const index = memos.value.findIndex(m => m.id === id)
    if (index !== -1) {
      memos.value.splice(index, 1)
      layer.msg('删除成功', { icon: 1 })
    }
  })
}
</script>

<style scoped>
.memo-page {
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
  transition: all 0.25s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 16px;
  width: 280px;
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #334155;
  outline: none;
}

.search-box i {
  color: #94a3b8;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  outline: none;
}

.filter-btn {
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}

.filter-btn.active {
  background: var(--primary-color, #1e4d7b);
  border-color: var(--primary-color, #1e4d7b);
  color: #fff;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.memo-card {
  background: #fef3c7;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.memo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.memo-card.blue {
  background: #dbeafe;
}

.memo-card.green {
  background: #dcfce7;
}

.memo-card.pink {
  background: #fce7f3;
}

.memo-card.purple {
  background: #f3e8ff;
}

.memo-card.pinned {
  border: 2px solid var(--primary-color, #1e4d7b);
}

.pin-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--primary-color, #1e4d7b);
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.memo-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  flex: 1;
}

.delete-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
}

.memo-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.memo-content {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
}

.memo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.memo-time {
  font-size: 12px;
  color: #94a3b8;
}

.reminder-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.empty-state {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #94a3b8;
  gap: 12px;
}

.empty-state i {
  font-size: 48px;
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
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.color-picker {
  display: flex;
  gap: 10px;
}

.color-btn {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn.active {
  border-color: #334155;
  transform: scale(1.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group label {
  margin-bottom: 0;
  cursor: pointer;
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
  .memo-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .empty-state {
    grid-column: span 3;
  }
}

@media (max-width: 900px) {
  .memo-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .empty-state {
    grid-column: span 2;
  }
}

@media (max-width: 600px) {
  .memo-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    grid-column: span 1;
  }

  .modal-content {
    width: 90%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>