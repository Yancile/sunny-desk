<template>
  <div class="bookmarks-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">网站导航</h1>
        <p class="page-desc">快捷访问常用网站</p>
      </div>
      <button class="add-btn" @click="showAddModal = true">
        <i class="layui-icon layui-icon-add-circle"></i>
        添加网站
      </button>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="layui-icon layui-icon-search"></i>
        <input type="text" v-model="searchKeyword" placeholder="搜索网站..." />
      </div>
      <div class="filter-group">
        <select v-model="categoryFilter" class="filter-select">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <button class="manage-categories-btn" @click="showCategoryModal = true">
          <i class="layui-icon layui-icon-set"></i> 管理分类
        </button>
      </div>
    </div>

    <div class="category-tabs">
      <button v-for="cat in categories" :key="cat.id" class="tab-btn" :class="{ active: activeCategory === cat.id }" @click="activeCategory = cat.id">
        <i :class="cat.icon"></i>
        {{ cat.name }}
        <span class="tab-count">{{ getCategoryLinks(cat.id).length }}</span>
      </button>
    </div>

    <div class="links-grid">
      <div v-for="link in filteredLinks" :key="link.id" class="link-card" draggable="true" @dragstart="dragStart($event, link)" @dragover.prevent @drop="drop($event, link)">
        <div class="link-icon" :style="{ background: link.color || '#3b82f6' }">
          <i :class="link.icon || 'layui-icon layui-icon-link'"></i>
        </div>
        <div class="link-content">
          <div class="link-name">{{ link.name }}</div>
          <div class="link-url">{{ link.url }}</div>
        </div>
        <div class="link-stats">
          <span class="click-count">点击 {{ link.clickCount || 0 }} 次</span>
        </div>
        <div class="link-actions">
          <button class="visit-btn" @click="visitLink(link)">
            <i class="layui-icon layui-icon-open"></i>
          </button>
          <button class="edit-btn" @click="editLink(link)">
            <i class="layui-icon layui-icon-edit"></i>
          </button>
          <button class="delete-btn" @click="deleteLink(link.id)">
            <i class="layui-icon layui-icon-delete"></i>
          </button>
        </div>
      </div>
      <div v-if="filteredLinks.length === 0" class="empty-state">
        <i class="layui-icon layui-icon-link"></i>
        <span>暂无网站，点击上方按钮添加</span>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingLink ? '编辑网站' : '添加网站' }}</span>
          <button class="modal-close" @click="closeAddModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>网站名称</label>
            <input type="text" v-model="formData.name" placeholder="请输入网站名称" class="form-input" />
          </div>
          <div class="form-group">
            <label>网站 URL</label>
            <input type="url" v-model="formData.url" placeholder="请输入网站地址" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <select v-model="formData.categoryId" class="form-select">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>图标</label>
              <div class="icon-picker">
                <button v-for="icon in linkIcons" :key="icon" class="icon-btn" :class="{ active: formData.icon === icon }" @click="formData.icon = icon">
                  <i :class="icon"></i>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>颜色</label>
              <div class="color-picker">
                <button v-for="color in linkColors" :key="color" class="color-btn" :class="{ active: formData.color === color }" :style="{ background: color }" @click="formData.color = color"></button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddModal">取消</button>
          <button class="btn-confirm" @click="saveLink">{{ editingLink ? '保存修改' : '添加网站' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showCategoryModal" class="modal-overlay" @click.self="closeCategoryModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">管理分类</span>
          <button class="modal-close" @click="closeCategoryModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="category-list">
            <div v-for="cat in categories" :key="cat.id" class="category-item">
              <div class="category-info">
                <i :class="cat.icon"></i>
                <span>{{ cat.name }}</span>
              </div>
              <div class="category-actions">
                <button class="delete-cat-btn" @click="deleteCategory(cat.id)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="add-category">
            <input type="text" v-model="newCategoryName" placeholder="新分类名称" class="form-input" />
            <button class="add-cat-btn" @click="addCategory">添加</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeCategoryModal">关闭</button>
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

const categories = ref([
  { id: 1, name: '开发工具', icon: 'layui-icon layui-icon-code' },
  { id: 2, name: '学习资源', icon: 'layui-icon layui-icon-education' },
  { id: 3, name: '新闻资讯', icon: 'layui-icon layui-icon-news' },
  { id: 4, name: '社交娱乐', icon: 'layui-icon layui-icon-face-smile' },
  { id: 5, name: '常用工具', icon: 'layui-icon layui-icon-tool' },
])

const links = ref([
  { id: 1, name: 'GitHub', url: 'https://github.com', categoryId: 1, icon: 'layui-icon layui-icon-code-circle', color: '#333', clickCount: 156 },
  { id: 2, name: 'MDN', url: 'https://developer.mozilla.org', categoryId: 1, icon: 'layui-icon layui-icon-book', color: '#217346', clickCount: 89 },
  { id: 3, name: 'Vue.js', url: 'https://vuejs.org', categoryId: 1, icon: 'layui-icon layui-icon-code-circle', color: '#42b883', clickCount: 124 },
  { id: 4, name: '掘金', url: 'https://juejin.cn', categoryId: 2, icon: 'layui-icon layui-icon-note', color: '#1e80ff', clickCount: 67 },
  { id: 5, name: 'LeetCode', url: 'https://leetcode.cn', categoryId: 2, icon: 'layui-icon layui-icon-list', color: '#f5a623', clickCount: 234 },
  { id: 6, name: '知乎', url: 'https://zhihu.com', categoryId: 3, icon: 'layui-icon layui-icon-link', color: '#0084ff', clickCount: 45 },
  { id: 7, name: 'B站', url: 'https://bilibili.com', categoryId: 4, icon: 'layui-icon layui-icon-play', color: '#fb7299', clickCount: 189 },
  { id: 8, name: '百度', url: 'https://baidu.com', categoryId: 5, icon: 'layui-icon layui-icon-search', color: '#2932e1', clickCount: 312 },
])

const searchKeyword = ref('')
const categoryFilter = ref('')
const activeCategory = ref('')
const showAddModal = ref(false)
const showCategoryModal = ref(false)
const editingLink = ref(null)
const newCategoryName = ref('')
const draggedLink = ref(null)

const linkIcons = [
  'layui-icon layui-icon-code-circle',
  'layui-icon layui-icon-book',
  'layui-icon layui-icon-link',
  'layui-icon layui-icon-search',
  'layui-icon layui-icon-play',
  'layui-icon layui-icon-note',
  'layui-icon layui-icon-list',
  'layui-icon layui-icon-home',
]

const linkColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#0d9488', '#ec4899']

const formData = reactive({
  name: '',
  url: '',
  categoryId: 1,
  icon: 'layui-icon layui-icon-link',
  color: '#3b82f6'
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const filteredLinks = computed(() => {
  let result = links.value
  
  if (activeCategory.value) {
    result = result.filter(l => l.categoryId === Number(activeCategory.value))
  } else if (categoryFilter.value) {
    result = result.filter(l => l.categoryId === Number(categoryFilter.value))
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(l => 
      l.name.toLowerCase().includes(keyword) || 
      l.url.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const getCategoryLinks = (categoryId) => {
  return links.value.filter(l => l.categoryId === categoryId)
}

const visitLink = (link) => {
  link.clickCount++
  window.open(link.url, '_blank')
}

const editLink = (link) => {
  editingLink.value = { ...link }
  formData.name = link.name
  formData.url = link.url
  formData.categoryId = link.categoryId
  formData.icon = link.icon || 'layui-icon layui-icon-link'
  formData.color = link.color || '#3b82f6'
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  editingLink.value = null
  formData.name = ''
  formData.url = ''
  formData.categoryId = 1
  formData.icon = 'layui-icon layui-icon-link'
  formData.color = '#3b82f6'
}

const saveLink = () => {
  if (!formData.name.trim()) {
    layer.msg('请输入网站名称', { icon: 5 })
    return
  }
  if (!formData.url.trim()) {
    layer.msg('请输入网站地址', { icon: 5 })
    return
  }
  if (editingLink.value) {
    const index = links.value.findIndex(l => l.id === editingLink.value.id)
    if (index !== -1) {
      links.value[index] = { ...formData, id: editingLink.value.id, clickCount: editingLink.value.clickCount }
      layer.msg('修改成功', { icon: 1 })
    }
  } else {
    links.value.push({
      ...formData,
      id: Date.now(),
      clickCount: 0
    })
    layer.msg('添加成功', { icon: 1 })
  }
  closeAddModal()
}

const deleteLink = (id) => {
  layer.confirm('确定删除该网站吗？', { icon: 3 }, () => {
    const index = links.value.findIndex(l => l.id === id)
    if (index !== -1) {
      links.value.splice(index, 1)
      layer.msg('删除成功', { icon: 1 })
    }
  })
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  newCategoryName.value = ''
}

const addCategory = () => {
  if (!newCategoryName.value.trim()) {
    layer.msg('请输入分类名称', { icon: 5 })
    return
  }
  categories.value.push({
    id: Date.now(),
    name: newCategoryName.value,
    icon: 'layui-icon layui-icon-link'
  })
  newCategoryName.value = ''
  layer.msg('添加成功', { icon: 1 })
}

const deleteCategory = (id) => {
  const linkCount = getCategoryLinks(id).length
  if (linkCount > 0) {
    layer.msg('该分类下还有网站，请先删除网站', { icon: 5 })
    return
  }
  const index = categories.value.findIndex(c => c.id === id)
  if (index !== -1) {
    categories.value.splice(index, 1)
    layer.msg('删除成功', { icon: 1 })
  }
}

const dragStart = (event, link) => {
  draggedLink.value = link
  event.dataTransfer.effectAllowed = 'move'
}

const drop = (event, targetLink) => {
  if (!draggedLink.value || draggedLink.value.id === targetLink.id) return
  
  const draggedIndex = links.value.findIndex(l => l.id === draggedLink.value.id)
  const targetIndex = links.value.findIndex(l => l.id === targetLink.id)
  
  if (draggedIndex !== -1 && targetIndex !== -1) {
    const [removed] = links.value.splice(draggedIndex, 1)
    links.value.splice(targetIndex, 0, removed)
  }
  
  draggedLink.value = null
}
</script>

<style scoped>
.bookmarks-page {
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

.manage-categories-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--primary-color, #1e4d7b);
  border-color: var(--primary-color, #1e4d7b);
  color: #fff;
}

.tab-count {
  background: color-mix(in srgb, #94a3b8 20%, transparent);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.link-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: move;
  transition: all 0.25s ease;
}

.link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.link-card.dragging {
  opacity: 0.5;
}

.link-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin-bottom: 12px;
}

.link-content {
  flex: 1;
}

.link-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.link-url {
  font-size: 12px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-stats {
  margin-top: 12px;
}

.click-count {
  font-size: 12px;
  color: #94a3b8;
}

.link-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.visit-btn,
.edit-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
}

.link-card:hover .visit-btn,
.link-card:hover .edit-btn,
.link-card:hover .delete-btn {
  opacity: 1;
}

.visit-btn {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
}

.edit-btn {
  background: #f8fafc;
  color: #64748b;
}

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
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
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 500px;
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
.form-select:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #64748b;
}

.icon-btn.active {
  border-color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.color-picker {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
}

.color-btn.active {
  border-color: #334155;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #334155;
}

.delete-cat-btn {
  padding: 6px;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}

.add-category {
  display: flex;
  gap: 10px;
}

.add-category .form-input {
  flex: 1;
}

.add-cat-btn {
  padding: 10px 20px;
  background: var(--primary-color, #1e4d7b);
  border: none;
  border-radius: 8px;
  color: #fff;
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

.btn-confirm {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .links-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .empty-state {
    grid-column: span 3;
  }
}

@media (max-width: 900px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .empty-state {
    grid-column: span 2;
  }
}

@media (max-width: 600px) {
  .links-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    grid-column: span 1;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }
}
</style>