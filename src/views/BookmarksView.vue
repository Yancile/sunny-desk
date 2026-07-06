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

    <div class="main-content">
      <div class="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">分类</span>
          <button class="manage-categories-btn" @click="showCategoryModal = true">
            <i class="layui-icon layui-icon-set"></i>
          </button>
        </div>
        <div class="category-list">
          <button class="category-item" :class="{ active: activeCategory === '' }" @click="activeCategory = ''">
            <span>全部网站</span>
            <span class="category-count">{{ links.length }}</span>
          </button>
          <button v-for="cat in categories" :key="cat.id" class="category-item"
            :class="{ active: activeCategory === cat.id, editing: editingCatId === cat.id }"
            @click="activeCategory = cat.id">
            <div v-if="editingCatId !== cat.id" class="cat-name-wrapper" @dblclick.stop="startSidebarEdit(cat)">
              <span>{{ cat.name }}</span>
            </div>
            <input v-else type="text" ref="editInputRef" class="cat-edit-input" v-model="editingCatName"
              @blur="saveSidebarEdit(cat.id)" @keyup.enter="saveSidebarEdit(cat.id)" @keyup.esc="cancelSidebarEdit" />
            <span class="category-count">{{ getCategoryLinks(cat.id).length }}</span>
          </button>
        </div>

        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-value">{{ links.length }}</span>
            <span class="stat-label">总网站</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ categories.length }}</span>
            <span class="stat-label">分类数</span>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div class="search-bar">
          <div class="search-box">
            <i class="layui-icon layui-icon-search"></i>
            <input type="text" v-model="searchKeyword" placeholder="搜索网站..." />
            <button v-if="searchKeyword" class="clear-search" @click="searchKeyword = ''">
              <i class="layui-icon layui-icon-close"></i>
            </button>
          </div>
          <div class="view-toggle">
            <button class="toggle-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="网格视图">
              <i class="layui-icon layui-icon-table"></i>
            </button>
            <button class="toggle-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="列表视图">
              <i class="layui-icon layui-icon-list"></i>
            </button>
          </div>
        </div>

        <div class="links-container" :class="viewMode">
          <div v-for="link in filteredLinks" :key="link.id" class="link-item" draggable="true"
            @dragstart="dragStart($event, link)" @dragover.prevent @drop="drop($event, link)" @click="visitLink(link)">
            <div class="link-icon" :style="{ background: link.color || '#3b82f6' }">
              <i :class="link.icon || 'layui-icon layui-icon-link'"></i>
            </div>
            <div class="link-info">
              <div class="link-name">{{ link.name }}</div>
              <div class="link-url">{{ link.url }}</div>
            </div>
            <div class="link-meta">
              <span class="click-count">点击 {{ link.clickCount || 0 }} 次</span>
              <span class="link-category">{{ getCategoryName(link.categoryId) }}</span>
            </div>
            <div class="link-actions">
              <button class="edit-btn" @click.stop="editLink(link)">
                <i class="layui-icon layui-icon-edit"></i>
              </button>
              <button class="delete-btn" @click.stop="deleteLink(link.id)">
                <i class="layui-icon layui-icon-delete"></i>
              </button>
            </div>
          </div>
          <div v-if="filteredLinks.length === 0" class="empty-state">
            <i class="layui-icon layui-icon-link"></i>
            <span>暂无网站，点击上方按钮添加</span>
          </div>
        </div>
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
          <div class="preview-section">
            <div class="preview-label">预览效果</div>
            <div class="preview-card">
              <div class="preview-icon" :style="{ background: formData.color }">
                <i :class="formData.icon"></i>
              </div>
              <div class="preview-info">
                <div class="preview-name">{{ formData.name || '网站名称' }}</div>
                <div class="preview-url">{{ formData.url || 'https://example.com' }}</div>
              </div>
            </div>
          </div>

          <div class="form-section">
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
            </div>

            <div class="form-group">
              <label>图标</label>
              <div class="icon-picker-horizontal">
                <button v-for="icon in linkIcons" :key="icon" class="icon-btn"
                  :class="{ active: formData.icon === icon }" @click="formData.icon = icon">
                  <i :class="icon"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>颜色</label>
              <div class="color-picker-horizontal">
                <button v-for="color in linkColors" :key="color" class="color-btn"
                  :class="{ active: formData.color === color }" :style="{ background: color }"
                  @click="formData.color = color"></button>
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
                <div v-if="editingCategoryId !== cat.id" class="category-name" @click="startEditCategory(cat)">
                  {{ cat.name }}
                </div>
                <input v-else type="text" v-model="editingCategoryName" class="category-edit-input"
                  @blur="saveEditCategory(cat.id)" @keyup.enter="saveEditCategory(cat.id)"
                  @keyup.esc="cancelEditCategory" />
              </div>
              <div class="category-actions">
                <button class="edit-cat-btn" @click="startEditCategory(cat)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'
import { dataManager } from '@/utils/dataManager'

const appStore = useAppStore()

const categories = ref([])
const links = ref([])

const loadBookmarks = () => {
  links.value = dataManager.bookmarks.getAll()
}

const loadCategories = () => {
  categories.value = dataManager.categories.getAll()
}

onMounted(() => {
  loadBookmarks()
  loadCategories()
})

const searchKeyword = ref('')
const activeCategory = ref('')
const viewMode = ref('grid')
const showAddModal = ref(false)
const showCategoryModal = ref(false)
const editingLink = ref(null)
const newCategoryName = ref('')
const draggedLink = ref(null)
const editingCategoryId = ref(null)
const editingCategoryName = ref('')
const editingCatId = ref(null)
const editingCatName = ref('')
const editInputRef = ref(null)

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

const getCategoryName = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : ''
}

const visitLink = (link) => {
  dataManager.bookmarks.update({
    id: link.id,
    clickCount: (link.clickCount || 0) + 1
  })
  window.open(link.url, '_blank')
  loadBookmarks()
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
    dataManager.bookmarks.update(editingLink.value.id, {
      name: formData.name.trim(),
      url: formData.url.trim(),
      categoryId: formData.categoryId,
      icon: formData.icon,
      color: formData.color
    })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.bookmarks.add({
      name: formData.name.trim(),
      url: formData.url.trim(),
      categoryId: formData.categoryId,
      icon: formData.icon,
      color: formData.color
    })
    layer.msg('添加成功', { icon: 1 })
  }

  loadBookmarks()
  closeAddModal()
}

const deleteLink = (id) => {
  if (confirm('确定删除该网站吗？')) {
    const success = dataManager.bookmarks.delete(id)
    if (success) {
      bookmarks.value = bookmarks.value.filter(b => String(b.id) !== String(id))
      layer.msg('删除成功', { icon: 1 })
    } else {
      layer.msg('删除失败', { icon: 5 })
    }
  }
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
  dataManager.categories.add({
    name: newCategoryName.value,
    icon: 'layui-icon layui-icon-link'
  })
  newCategoryName.value = ''
  loadCategories()
  layer.msg('添加成功', { icon: 1 })
}

const deleteCategory = (id) => {
  const linkCount = getCategoryLinks(id).length
  if (linkCount > 0) {
    layer.msg('该分类下还有网站，请先删除网站', { icon: 5 })
    return
  }
  const success = dataManager.categories.delete(id)
  if (success) {
    categories.value = categories.value.filter(c => String(c.id) !== String(id))
    layer.msg('删除成功', { icon: 1 })
  } else {
    layer.msg('删除失败', { icon: 5 })
  }
}

const startEditCategory = (cat) => {
  editingCategoryId.value = cat.id
  editingCategoryName.value = cat.name
}

const saveEditCategory = (id) => {
  if (!editingCategoryName.value.trim()) {
    layer.msg('分类名称不能为空', { icon: 5 })
    return
  }
  dataManager.categories.update({
    id: id,
    name: editingCategoryName.value.trim()
  })
  loadCategories()
  layer.msg('修改成功', { icon: 1 })
  editingCategoryId.value = null
  editingCategoryName.value = ''
}

const cancelEditCategory = () => {
  editingCategoryId.value = null
  editingCategoryName.value = ''
}

const startSidebarEdit = (cat) => {
  editingCatId.value = cat.id
  editingCatName.value = cat.name
  setTimeout(() => {
    const input = document.querySelector('.cat-edit-input')
    if (input) {
      input.focus()
      input.select()
    }
  }, 100)
}

const saveSidebarEdit = (id) => {
  if (!editingCatName.value.trim()) {
    layer.msg('分类名称不能为空', { icon: 5 })
    return
  }
  dataManager.categories.update({
    id: id,
    name: editingCatName.value.trim()
  })
  loadCategories()
  layer.msg('修改成功', { icon: 1 })
  editingCatId.value = null
  editingCatName.value = ''
}

const cancelSidebarEdit = () => {
  editingCatId.value = null
  editingCatName.value = ''
}

const dragStart = (event, link) => {
  draggedLink.value = link
  event.dataTransfer.effectAllowed = 'move'
}

const drop = (event, targetLink) => {
  if (!draggedLink.value || draggedLink.value.id === targetLink.id) return

  const list = links.value
  const draggedIndex = list.findIndex(l => l.id === draggedLink.value.id)
  const targetIndex = list.findIndex(l => l.id === targetLink.id)

  if (draggedIndex !== -1 && targetIndex !== -1) {
    const [removed] = list.splice(draggedIndex, 1)
    list.splice(targetIndex, 0, removed)
    dataManager.bookmarks.saveAll(list)
  }

  draggedLink.value = null
}
</script>

<style scoped>
.bookmarks-page {
  padding: 24px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-shrink: 0;
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

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.manage-categories-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.manage-categories-btn:hover {
  color: #64748b;
}

.category-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  transition: all 0.2s ease;
  text-align: left;
}

.category-item:hover {
  background: #f8fafc;
}

.category-item.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
  font-weight: 500;
}

.category-item i {
  font-size: 16px;
  width: 20px;
}

.category-item span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-name-wrapper {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.cat-name-wrapper:hover {
  text-decoration: underline;
}

.cat-edit-input {
  flex: 1;
  padding: 4px 8px;
  border: 2px solid var(--primary-color, #1e4d7b);
  border-radius: 6px;
  font-size: 14px;
  color: #334155;
  outline: none;
  background: #fff;
}

.category-item.editing {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 5%, transparent);
}

.category-count {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.category-item.active .category-count {
  background: rgba(30, 77, 123, 0.15);
  color: var(--primary-color, #1e4d7b);
}

.quick-stats {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color, #1e4d7b);
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
  flex: 1;
  max-width: 400px;
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

.clear-search {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
}

.clear-search:hover {
  color: #64748b;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #f8fafc;
}

.toggle-btn.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
}

.links-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.links-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.links-container.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-item {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.links-container.grid .link-item {
  flex-direction: column;
  text-align: center;
  gap: 8px;
  padding: 14px;
}

.link-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.link-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}

.links-container.grid .link-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.links-container.grid .link-info {
  flex: none;
  width: 100%;
}

.link-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 2px;
}

.link-url {
  font-size: 11px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
}

.links-container.grid .link-meta {
  flex: none;
}

.click-count {
  display: inline-flex;
  align-items: center;
}

.link-category {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  display: inline-block;
}

.link-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.link-item:hover .link-actions {
  opacity: 1;
}

.links-container.grid .link-actions {
  opacity: 1;
}

.edit-btn,
.delete-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
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
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
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
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex: 1;
  overflow-y: auto;
}

.preview-section {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.preview-label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 12px;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.preview-url {
  font-size: 12px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-section {
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

.icon-picker-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  color: #64748b;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f1f5f9;
}

.icon-btn.active {
  border-color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.color-picker-horizontal {
  display: flex;
  gap: 10px;
}

.color-picker {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
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

.edit-cat-btn,
.delete-cat-btn {
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.edit-cat-btn {
  color: #64748b;
}

.delete-cat-btn {
  color: #ef4444;
}

.category-name {
  cursor: pointer;
}

.category-name:hover {
  color: var(--primary-color, #1e4d7b);
}

.category-edit-input {
  padding: 4px 8px;
  border: 1px solid var(--primary-color, #1e4d7b);
  border-radius: 4px;
  font-size: 14px;
  color: #334155;
  outline: none;
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

@media (max-width: 900px) {
  .sidebar {
    width: 180px;
  }

  .links-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 600px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-shrink: 0;
  }

  .category-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }

  .category-item {
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 13px;
  }

  .category-count {
    display: none;
  }

  .quick-stats {
    display: none;
  }

  .links-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 90%;
  }
}
</style>