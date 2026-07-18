<template>
  <div class="notes-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <div class="page-title-wrapper">
          <i class="layui-icon layui-icon-book"></i>
          <h1 class="page-title">我的笔记本</h1>
        </div>
      </div>
    </div>

    <div class="breadcrumbs" v-if="selectedNotebook">
      <span class="breadcrumb-item" :class="{ active: !selectedSection }"
        @click="selectedSection = null; selectedNote = null">
        {{ selectedNotebook.icon }} {{ selectedNotebook.name }}
      </span>
      <span class="breadcrumb-separator">></span>
      <template v-if="selectedSection">
        <span v-for="(item, index) in sectionBreadcrumbs" :key="item.id" class="breadcrumb-item"
          :class="{ active: index === sectionBreadcrumbs.length - 1 && !selectedNote }"
          @click="navigateToSection(item)">
          {{ item.name }}
        </span>
        <span v-if="index < sectionBreadcrumbs.length - 1" class="breadcrumb-separator">></span>
      </template>
      <span v-if="selectedNote" class="breadcrumb-separator">></span>
      <span v-if="selectedNote" class="breadcrumb-item active">
        {{ selectedNote.title || '无标题' }}
      </span>
    </div>

    <div class="content-row">
      <div class="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">笔记本</span>
          <button class="add-notebook-btn" @click="showNotebookModal = true; editingNotebook = null">
            <i class="layui-icon layui-icon-add-1"></i>
          </button>
        </div>
        <div class="notebook-tree">
          <div v-for="notebook in notebooks" :key="notebook.id">
            <div class="notebook-node">
              <div class="notebook-item"
                :class="{ active: selectedNotebook?.id === notebook.id, expanded: expandedNotebooks.includes(notebook.id) }"
                @click="toggleNotebookExpand(notebook.id); selectedNotebook = notebook"
                @contextmenu.prevent="showNotebookContextMenu($event, notebook)">
                <button class="expand-btn" @click.stop="toggleNotebookExpand(notebook.id)">
                  <i class="layui-icon"
                    :class="expandedNotebooks.includes(notebook.id) ? 'layui-icon-down' : 'layui-icon-right'"></i>
                </button>
                <span class="notebook-icon">{{ notebook.icon }}</span>
                <span class="notebook-name">{{ notebook.name }}</span>
                <button class="notebook-add-section"
                  @click.stop="selectedNotebook = notebook; showSectionModal = true; parentSectionId = null">
                  <i class="layui-icon layui-icon-add-1"></i>
                </button>
              </div>
              <div v-if="expandedNotebooks.includes(notebook.id)" class="notebook-children">
                <div v-for="section in getSections(notebook.id).filter(s => s.parentId === null)" :key="section.id">
                  <div class="section-node">
                    <div class="section-item" :class="{ active: selectedSection?.id === section.id }"
                      @click="selectSection(section)" @contextmenu.prevent="showSectionContextMenu($event, section)">
                      <button v-if="hasChildren(section.id)" class="expand-btn"
                        @click.stop="toggleSectionExpand(section.id)">
                        <i class="layui-icon"
                          :class="expandedSections.includes(section.id) ? 'layui-icon-down' : 'layui-icon-right'"></i>
                      </button>
                      <span v-else class="expand-placeholder"></span>
                      <span class="section-name">{{ section.name }}</span>
                      <button class="section-add-child" @click.stop="showAddSubSection(section)">
                        <i class="layui-icon layui-icon-add-1"></i>
                      </button>
                    </div>
                    <div v-if="expandedSections.includes(section.id)" class="section-children">
                      <div v-for="child in getChildren(section.id)" :key="child.id">
                        <div class="section-node">
                          <div class="section-item child" :class="{ active: selectedSection?.id === child.id }"
                            @click="selectSection(child)" @contextmenu.prevent="showSectionContextMenu($event, child)">
                            <button v-if="hasChildren(child.id)" class="expand-btn"
                              @click.stop="toggleSectionExpand(child.id)">
                              <i class="layui-icon"
                                :class="expandedSections.includes(child.id) ? 'layui-icon-down' : 'layui-icon-right'"></i>
                            </button>
                            <span v-else class="expand-placeholder"></span>
                            <span class="section-name">{{ child.name }}</span>
                            <button class="section-add-child" @click.stop="showAddSubSection(child)">
                              <i class="layui-icon layui-icon-add-1"></i>
                            </button>
                          </div>
                          <div v-if="expandedSections.includes(child.id)" class="section-children">
                            <div v-for="grandchild in getChildren(child.id)" :key="grandchild.id">
                              <div class="section-item grandchild"
                                :class="{ active: selectedSection?.id === grandchild.id }"
                                @click="selectSection(grandchild)"
                                @contextmenu.prevent="showSectionContextMenu($event, grandchild)">
                                <span class="expand-placeholder"></span>
                                <span class="section-name">{{ grandchild.name }}</span>
                                <button class="section-add-child" @click.stop="showAddSubSection(grandchild)">
                                  <i class="layui-icon layui-icon-add-1"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="section-notes">
                      <div v-for="note in getNotesForSection(section.id)" :key="note.id">
                        <div class="note-item" :class="{ active: selectedNote?.id === note.id }"
                          @click="selectNote(note)" @contextmenu.prevent="showNoteContextMenu($event, note)">
                          <span class="expand-placeholder"></span>
                          <span class="note-title">{{ note.title || '无标题' }}</span>
                          <button class="note-delete" @click.stop="deleteNote(note.id)">
                            <i class="layui-icon layui-icon-delete"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-area">
        <div v-if="selectedNote" class="note-editor">
          <div class="editor-header">
            <button class="back-btn" @click="selectedNote = null">
              <i class="layui-icon layui-icon-left"></i>
              返回列表
            </button>
            <div class="editor-title-wrapper">
              <input type="text" v-model="selectedNote.title" class="title-input" placeholder="笔记标题" />
            </div>
            <div class="editor-actions">
              <span class="update-time">更新于 {{ formatDateTime(selectedNote.updatedAt || selectedNote.createdAt)
                }}</span>
              <button class="save-btn" @click="saveCurrentNote">
                <i class="layui-icon layui-icon-save"></i> 保存
              </button>
              <button class="delete-btn" @click="deleteNote(selectedNote.id)">
                <i class="layui-icon layui-icon-delete"></i>
              </button>
            </div>
          </div>
          <div class="editor-body">
            <textarea v-model="selectedNote.content" class="content-editor"
              placeholder="开始编写笔记...&#10;&#10;支持 Markdown 语法：&#10;# 标题&#10;**加粗** *斜体*&#10;- 列表"></textarea>
          </div>
          <div class="editor-preview">
            <div class="preview-header">
              <span class="preview-title">预览</span>
            </div>
            <div class="preview-content" v-html="renderMarkdown(selectedNote.content)"></div>
          </div>
        </div>
        <div v-else-if="selectedSection" class="empty-editor">
          <div class="empty-content">
            <i class="layui-icon layui-icon-file"></i>
            <span>请选择笔记</span>
            <button class="create-note-btn"
              @click="showNoteModal = true; parentNoteId = null; formData.title = ''; formData.content = ''; formData.tags = []; formData.sectionId = selectedSection.id; formData.notebookId = selectedNotebook?.id">
              <i class="layui-icon layui-icon-add-circle"></i> 新建笔记
            </button>
          </div>
        </div>
        <div v-else-if="selectedNotebook" class="empty-editor">
          <div class="empty-content">
            <span>选择分区查看笔记</span>
          </div>
        </div>
        <div v-else class="empty-editor">
          <div class="empty-content">
            <i class="layui-icon layui-icon-book"></i>
            <span>选择笔记本开始写作</span>
            <button class="create-note-btn" @click="showNotebookModal = true">
              <i class="layui-icon layui-icon-add-circle"></i> 创建笔记本
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showNoteModal" class="modal-overlay" @click.self="closeNoteModal">
    <div class="modal-content small">
      <div class="modal-header">
        <span class="modal-title">{{ editingNote ? '编辑笔记' : (parentNoteId ? '新建子笔记' : '新建笔记') }}</span>
        <button class="modal-close" @click="closeNoteModal">
          <i class="layui-icon layui-icon-close"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>标题</label>
          <input type="text" v-model="formData.title" placeholder="请输入标题" class="form-input" />
        </div>
        <div class="form-group" v-if="selectedNotebook && !parentNoteId">
          <label>所属分区</label>
          <select v-model="formData.sectionId" class="form-select">
            <option value="">未分类</option>
            <option v-for="section in getSections(selectedNotebook.id)" :key="section.id" :value="section.id">{{
              section.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>标签</label>
          <input type="text" v-model="tagInput" placeholder="输入标签，回车添加" class="form-input" @keyup.enter="addTag" />
          <div v-if="formData.tags && formData.tags.length > 0" class="tag-list">
            <span v-for="tag in formData.tags" :key="tag" class="tag-item">
              {{ tag }}
              <button @click="removeTag(tag)">×</button>
            </span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeNoteModal">取消</button>
        <button class="btn-confirm" @click="saveNote">{{ editingNote ? '保存修改' : '创建笔记' }}</button>
      </div>
    </div>
  </div>

  <div v-if="showNotebookModal" class="modal-overlay" @click.self="closeNotebookModal">
    <div class="modal-content small">
      <div class="modal-header">
        <span class="modal-title">新建笔记本</span>
        <button class="modal-close" @click="closeNotebookModal">
          <i class="layui-icon layui-icon-close"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" v-model="notebookForm.name" placeholder="笔记本名称" class="form-input" />
        </div>
        <div class="form-group">
          <label>图标</label>
          <div class="emoji-picker">
            <button v-for="emoji in notebookEmojis" :key="emoji" class="emoji-btn"
              :class="{ active: notebookForm.icon === emoji }" @click="notebookForm.icon = emoji">
              {{ emoji }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>颜色</label>
          <div class="color-picker">
            <button v-for="color in notebookColors" :key="color" class="color-btn"
              :class="{ active: notebookForm.color === color }" :style="{ background: color }"
              @click="notebookForm.color = color"></button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeNotebookModal">取消</button>
        <button class="btn-confirm" @click="saveNotebook">创建</button>
      </div>
    </div>
  </div>

  <div v-if="showSectionModal" class="modal-overlay" @click.self="closeSectionModal">
    <div class="modal-content small">
      <div class="modal-header">
        <span class="modal-title">{{ editingSection ? '编辑分区' : (parentSectionId ? '新建子分区' : '新建分区') }}</span>
        <button class="modal-close" @click="closeSectionModal">
          <i class="layui-icon layui-icon-close"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>分区名称</label>
          <input type="text" v-model="sectionForm.name" placeholder="如：第一章 概述" class="form-input" />
        </div>
        <div class="form-group" v-if="parentSectionId">
          <label>父分区</label>
          <input type="text" :value="getParentSectionName(parentSectionId)" class="form-input" disabled />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeSectionModal">取消</button>
        <button class="btn-confirm" @click="saveSection">{{ editingSection ? '保存修改' : '创建' }}</button>
      </div>
    </div>
  </div>

  <div v-if="showNotebookModal" class="modal-overlay" @click.self="closeNotebookModal">
    <div class="modal-content small">
      <div class="modal-header">
        <span class="modal-title">{{ editingNotebook ? '编辑笔记本' : '新建笔记本' }}</span>
        <button class="modal-close" @click="closeNotebookModal">
          <i class="layui-icon layui-icon-close"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>名称</label>
          <input type="text" v-model="notebookForm.name" placeholder="笔记本名称" class="form-input" />
        </div>
        <div class="form-group">
          <label>图标</label>
          <div class="emoji-picker">
            <button v-for="emoji in notebookEmojis" :key="emoji" class="emoji-btn"
              :class="{ active: notebookForm.icon === emoji }" @click="notebookForm.icon = emoji">
              {{ emoji }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>颜色</label>
          <div class="color-picker">
            <button v-for="color in notebookColors" :key="color" class="color-btn"
              :class="{ active: notebookForm.color === color }" :style="{ background: color }"
              @click="notebookForm.color = color"></button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeNotebookModal">取消</button>
        <button class="btn-confirm" @click="saveNotebook">{{ editingNotebook ? '保存修改' : '创建' }}</button>
      </div>
    </div>
  </div>

  <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    @click.stop>
    <div class="context-menu-item" @click="handleContextMenuEdit">
      <i class="layui-icon layui-icon-edit"></i>
      <span>编辑</span>
    </div>
    <div class="context-menu-item" @click="handleContextMenuDelete">
      <i class="layui-icon layui-icon-delete"></i>
      <span>删除</span>
    </div>
    <div class="context-menu-divider"></div>
    <template v-if="contextMenu.type === 'notebook'">
      <div class="context-menu-item" @click="handleContextMenuAddSection">
        <i class="layui-icon layui-icon-add-1"></i>
        <span>新建分区</span>
      </div>
    </template>
    <template v-else-if="contextMenu.type === 'section'">
      <div class="context-menu-item" @click="handleContextMenuAddSubFolder">
        <i class="layui-icon layui-icon-add-1"></i>
        <span>新建子文件夹</span>
      </div>
      <div class="context-menu-item" @click="handleContextMenuAddNote">
        <i class="layui-icon layui-icon-add-circle"></i>
        <span>新建笔记</span>
      </div>
    </template>
    <template v-else-if="contextMenu.type === 'note'">
      <div class="context-menu-item" @click="handleContextMenuAddSubNote">
        <i class="layui-icon layui-icon-add-circle"></i>
        <span>新建子笔记</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'
import { dataManager } from '@/utils/dataManager'

const appStore = useAppStore()

const notebooks = ref([])
const sections = ref([])
const notes = ref([])

const loadData = () => {
  notebooks.value = dataManager.notebooks.getAll()
  sections.value = dataManager.sections.getAll()
  notes.value = dataManager.notes.getAll()
}

onMounted(() => {
  loadData()
})

const selectedNotebook = ref(null)
const selectedSection = ref(null)
const selectedNote = ref(null)

const searchKeyword = ref('')

const showNoteModal = ref(false)
const showNotebookModal = ref(false)
const showSectionModal = ref(false)
const editingNote = ref(null)
const tagInput = ref('')

const parentSectionId = ref(null)
const parentNoteId = ref(null)

const expandedSections = ref([1, 2, 8])
const expandedNotes = ref([1, 4])
const expandedNotebooks = ref([1, 2])

const editingNotebook = ref(null)
const editingSection = ref(null)

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  type: 'notebook',
  notebook: null,
  section: null,
  note: null
})

const notebookEmojis = ['📘', '📗', '📕', '📙', '📒', '📓', '📔', '📕', '📖', '📚', '📓', '📑', '📁', '📂', '📅', '📆']
const notebookColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b']

const formData = reactive({
  title: '',
  notebookId: '',
  sectionId: '',
  content: '',
  tags: []
})

const notebookForm = reactive({
  name: '',
  icon: '📘',
  color: '#3b82f6'
})

const sectionForm = reactive({
  name: ''
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const getSections = (notebookId) => {
  return sections.value.filter(s => s.notebookId === notebookId)
}

const rootSections = computed(() => {
  if (!selectedNotebook.value) return []
  return getSections(selectedNotebook.value.id).filter(s => s.parentId === null)
})

const getChildren = (parentId) => {
  if (!selectedNotebook.value) return []
  return getSections(selectedNotebook.value.id).filter(s => s.parentId === parentId)
}

const hasChildren = (parentId) => {
  return getChildren(parentId).length > 0
}

const getParentSectionName = (parentId) => {
  const section = sections.value.find(s => s.id === parentId)
  return section ? section.name : ''
}

const sectionBreadcrumbs = computed(() => {
  if (!selectedSection.value) return []
  const path = []
  let current = selectedSection.value
  while (current) {
    path.unshift(current)
    current = current.parentId ? sections.value.find(s => s.id === current.parentId) : null
  }
  return path
})

const filteredNotesList = computed(() => {
  if (!selectedSection.value) return []
  let result = notes.value.filter(n => n.sectionId === selectedSection.value.id)

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(n => n.title.toLowerCase().includes(keyword))
  }

  return result
})

const rootNotes = computed(() => {
  return filteredNotesList.value.filter(n => n.parentId === null)
})

const getNoteChildren = (parentId) => {
  return filteredNotesList.value.filter(n => n.parentId === parentId)
}

const hasNoteChildren = (parentId) => {
  return getNoteChildren(parentId).length > 0
}

const getNotesForSection = (sectionId) => {
  if (!selectedNotebook.value) return []
  return notes.value.filter(n => n.notebookId === selectedNotebook.value.id && n.sectionId === sectionId && n.parentId === null)
}

const renderMarkdown = (content) => {
  let html = content
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>')
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/\[\[([^\]]+)\]\]/gim, '<a href="#" class="wiki-link">$1</a>')
  html = html.replace(/\n/gim, '<br>')
  return html
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

const selectNotebook = (notebook) => {
  selectedNotebook.value = notebook
  selectedSection.value = null
  selectedNote.value = null
}

const selectSection = (section) => {
  selectedSection.value = section
  selectedNote.value = null
}

const selectNote = (note) => {
  selectedNote.value = note
}

const navigateToSection = (section) => {
  selectedSection.value = section
  selectedNote.value = null
}

const toggleSectionExpand = (sectionId) => {
  const index = expandedSections.value.indexOf(sectionId)
  if (index === -1) {
    expandedSections.value.push(sectionId)
  } else {
    expandedSections.value.splice(index, 1)
  }
}

const toggleNotebookExpand = (notebookId) => {
  const index = expandedNotebooks.value.indexOf(notebookId)
  if (index === -1) {
    expandedNotebooks.value.push(notebookId)
  } else {
    expandedNotebooks.value.splice(index, 1)
  }
}

const toggleNoteExpand = (noteId) => {
  const index = expandedNotes.value.indexOf(noteId)
  if (index === -1) {
    expandedNotes.value.push(noteId)
  } else {
    expandedNotes.value.splice(index, 1)
  }
}

const showAddSubSection = (parentSection) => {
  parentSectionId.value = parentSection.id
  sectionForm.name = ''
  showSectionModal.value = true
}

const showAddSubNote = (parentNote) => {
  parentNoteId.value = parentNote.id
  formData.title = ''
  formData.content = ''
  formData.tags = []
  formData.sectionId = parentNote.sectionId
  formData.notebookId = parentNote.notebookId
  showNoteModal.value = true
}

const editNotebook = (notebook) => {
  editingNotebook.value = notebook
  notebookForm.name = notebook.name
  notebookForm.icon = notebook.icon
  notebookForm.color = notebook.color
  showNotebookModal.value = true
}

const editSection = (section) => {
  editingSection.value = section
  sectionForm.name = section.name
  parentSectionId.value = section.parentId
  showSectionModal.value = true
}

const editNote = (note) => {
  editingNote.value = note
  formData.title = note.title || ''
  formData.content = note.content || ''
  formData.tags = [...(note.tags || [])]
  formData.sectionId = note.sectionId
  formData.notebookId = note.notebookId
  parentNoteId.value = note.parentId
  showNoteModal.value = true
}

const showNotebookContextMenu = (event, notebook) => {
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.type = 'notebook'
  contextMenu.notebook = notebook
  contextMenu.section = null
  selectedNotebook.value = notebook
}

const showSectionContextMenu = (event, section) => {
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.type = 'section'
  contextMenu.section = section
  contextMenu.notebook = null
  contextMenu.note = null
  selectedSection.value = section
}

const showNoteContextMenu = (event, note) => {
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.type = 'note'
  contextMenu.note = note
  contextMenu.notebook = null
  contextMenu.section = null
  selectedNote.value = note
}

const closeContextMenu = () => {
  contextMenu.show = false
  contextMenu.section = null
  contextMenu.notebook = null
  contextMenu.note = null
}

const handleContextMenuEdit = () => {
  if (contextMenu.type === 'notebook' && contextMenu.notebook) {
    editNotebook(contextMenu.notebook)
  } else if (contextMenu.type === 'section' && contextMenu.section) {
    editSection(contextMenu.section)
  } else if (contextMenu.type === 'note' && contextMenu.note) {
    editNote(contextMenu.note)
  }
  closeContextMenu()
}

const handleContextMenuDelete = () => {
  if (contextMenu.type === 'notebook' && contextMenu.notebook) {
    deleteNotebook(contextMenu.notebook.id)
  } else if (contextMenu.type === 'section' && contextMenu.section) {
    deleteSection(contextMenu.section.id)
  } else if (contextMenu.type === 'note' && contextMenu.note) {
    deleteNote(contextMenu.note.id)
  }
  closeContextMenu()
}

const handleContextMenuAddSection = () => {
  if (contextMenu.notebook) {
    selectedNotebook.value = contextMenu.notebook
    parentSectionId.value = null
    sectionForm.name = ''
    showSectionModal.value = true
  }
  closeContextMenu()
}

const handleContextMenuAddSubFolder = () => {
  if (contextMenu.section) {
    showAddSubSection(contextMenu.section)
  }
  closeContextMenu()
}

const handleContextMenuAddNote = () => {
  if (contextMenu.section) {
    selectedSection.value = contextMenu.section
    formData.title = ''
    formData.content = ''
    formData.tags = []
    formData.sectionId = contextMenu.section.id
    formData.notebookId = selectedNotebook.value?.id || ''
    parentNoteId.value = null
    showNoteModal.value = true
  }
  closeContextMenu()
}

const handleContextMenuAddSubNote = () => {
  if (contextMenu.note) {
    const parentNote = contextMenu.note
    formData.title = ''
    formData.content = ''
    formData.tags = []
    formData.sectionId = parentNote.sectionId
    formData.notebookId = parentNote.notebookId
    parentNoteId.value = parentNote.id
    showNoteModal.value = true
  }
  closeContextMenu()
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

const closeNoteModal = () => {
  showNoteModal.value = false
  editingNote.value = null
  parentNoteId.value = null
  tagInput.value = ''
  formData.title = ''
  formData.notebookId = selectedNotebook.value?.id || ''
  formData.sectionId = selectedSection.value?.id || ''
  formData.content = ''
  formData.tags = []
}

const saveNote = () => {
  if (!formData.title.trim()) {
    layer.msg('请输入标题', { icon: 5 })
    return
  }

  const notebookId = formData.notebookId || selectedNotebook.value?.id || ''
  const sectionId = formData.sectionId || selectedSection.value?.id || ''

  if (editingNote.value) {
    dataManager.notes.update({
      ...formData,
      id: editingNote.value.id,
      notebookId: notebookId || editingNote.value.notebookId,
      sectionId: sectionId || editingNote.value.sectionId,
      createdAt: editingNote.value.createdAt,
      updatedAt: new Date().toISOString()
    })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.notes.add({
      ...formData,
      notebookId: notebookId,
      sectionId: sectionId,
      parentId: parentNoteId.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    layer.msg('创建成功', { icon: 1 })
  }
  loadData()
  closeNoteModal()
}

const saveCurrentNote = () => {
  if (selectedNote.value) {
    selectedNote.value.updatedAt = new Date().toISOString()
    layer.msg('保存成功', { icon: 1 })
  }
}

const deleteNote = (id) => {
  const hasChildren = notes.value.some(n => String(n.parentId) === String(id))
  if (hasChildren) {
    if (confirm('该笔记有子笔记，确定删除吗？子笔记将变为顶级笔记。')) {
      notes.value.forEach(n => {
        if (String(n.parentId) === String(id)) {
          n.parentId = null
          dataManager.notes.update(n)
        }
      })
      const success = dataManager.notes.delete(id)
      if (success) {
        notes.value = notes.value.filter(n => String(n.id) !== String(id))
        selectedNote.value = null
        layer.msg('删除成功', { icon: 1 })
      } else {
        layer.msg('删除失败', { icon: 5 })
      }
    }
  } else {
    if (confirm('确定删除该笔记吗？')) {
      const success = dataManager.notes.delete(id)
      if (success) {
        notes.value = notes.value.filter(n => String(n.id) !== String(id))
        selectedNote.value = null
        layer.msg('删除成功', { icon: 1 })
      } else {
        layer.msg('删除失败', { icon: 5 })
      }
    }
  }
}

const closeNotebookModal = () => {
  showNotebookModal.value = false
  editingNotebook.value = null
  notebookForm.name = ''
  notebookForm.icon = '📘'
  notebookForm.color = '#3b82f6'
}

const saveNotebook = () => {
  if (!notebookForm.name.trim()) {
    layer.msg('请输入笔记本名称', { icon: 5 })
    return
  }
  if (editingNotebook.value) {
    dataManager.notebooks.update({ ...editingNotebook.value, ...notebookForm })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.notebooks.add({ ...notebookForm })
    layer.msg('创建成功', { icon: 1 })
  }
  loadData()
  closeNotebookModal()
}

const deleteNotebook = (id) => {
  if (confirm('确定删除该笔记本吗？所有分区和笔记将被删除。')) {
    const success = dataManager.notebooks.delete(id)
    if (success) {
      notebooks.value = notebooks.value.filter(n => String(n.id) !== String(id))
      sections.value.forEach(s => {
        if (String(s.notebookId) === String(id)) {
          dataManager.sections.delete(s.id)
        }
      })
      sections.value = sections.value.filter(s => String(s.notebookId) !== String(id))
      notes.value.forEach(n => {
        if (String(n.notebookId) === String(id)) {
          dataManager.notes.delete(n.id)
        }
      })
      notes.value = notes.value.filter(n => String(n.notebookId) !== String(id))
      if (String(selectedNotebook.value?.id) === String(id)) {
        selectedNotebook.value = null
        selectedSection.value = null
        selectedNote.value = null
      }
      layer.msg('删除成功', { icon: 1 })
    } else {
      layer.msg('删除失败', { icon: 5 })
    }
  }
}

const closeSectionModal = () => {
  showSectionModal.value = false
  editingSection.value = null
  parentSectionId.value = null
  sectionForm.name = ''
}

const saveSection = () => {
  if (!sectionForm.name.trim()) {
    layer.msg('请输入分区名称', { icon: 5 })
    return
  }
  if (editingSection.value) {
    dataManager.sections.update({ ...editingSection.value, name: sectionForm.name })
    layer.msg('修改成功', { icon: 1 })
  } else {
    dataManager.sections.add({
      name: sectionForm.name,
      notebookId: selectedNotebook.value.id,
      parentId: parentSectionId.value
    })
    layer.msg('创建成功', { icon: 1 })
  }
  loadData()
  closeSectionModal()
}

const deleteSection = (id) => {
  const hasChildren = sections.value.some(s => String(s.parentId) === String(id))
  if (hasChildren) {
    if (confirm('该分区有子分区，确定删除吗？子分区将变为顶级分区。')) {
      sections.value.forEach(s => {
        if (String(s.parentId) === String(id)) {
          s.parentId = null
          dataManager.sections.update(s)
        }
      })
      const success = dataManager.sections.delete(id)
      if (success) {
        sections.value = sections.value.filter(s => String(s.id) !== String(id))
        notes.value.forEach(n => {
          if (String(n.sectionId) === String(id)) {
            n.sectionId = null
            dataManager.notes.update(n)
          }
        })
        if (String(selectedSection.value?.id) === String(id)) {
          selectedSection.value = null
          selectedNote.value = null
        }
        layer.msg('删除成功', { icon: 1 })
      } else {
        layer.msg('删除失败', { icon: 5 })
      }
    }
  } else {
    if (confirm('确定删除该分区吗？所有笔记将被移到未分类。')) {
      const success = dataManager.sections.delete(id)
      if (success) {
        sections.value = sections.value.filter(s => String(s.id) !== String(id))
        notes.value.forEach(n => {
          if (String(n.sectionId) === String(id)) {
            n.sectionId = null
            dataManager.notes.update(n)
          }
        })
        if (String(selectedSection.value?.id) === String(id)) {
          selectedSection.value = null
          selectedNote.value = null
        }
        layer.msg('删除成功', { icon: 1 })
      } else {
        layer.msg('删除失败', { icon: 5 })
      }
    }
  }
}

watch(selectedNote, (newNote) => {
  if (newNote) {
    formData.title = newNote.title
    formData.content = newNote.content
    formData.tags = [...(newNote.tags || [])]
  }
})

onMounted(() => {
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.notes-page {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.breadcrumb-item {
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--primary-color, #1e4d7b);
}

.breadcrumb-item.active {
  color: var(--primary-color, #1e4d7b);
  font-weight: 500;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.content-row {
  flex: 1;
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-area {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.add-notebook-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #f8fafc;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-notebook-btn:hover {
  background: #f1f5f9;
  color: var(--primary-color, #1e4d7b);
}

.notebook-tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.notebook-node {
  margin-bottom: 2px;
}

.notebook-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notebook-item:hover {
  background: #f8fafc;
}

.notebook-item.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.notebook-icon {
  font-size: 18px;
}

.notebook-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notebook-add-section {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.2s ease;
}

.notebook-item:hover .notebook-add-section {
  opacity: 1;
}

.notebook-add-section:hover {
  color: var(--primary-color, #1e4d7b);
}

.notebook-children {
  padding-left: 12px;
}

.section-notes {
  padding-left: 20px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
}

.column-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.notebook-list,
.section-tree,
.note-tree {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.notebook-item,
.section-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notebook-item:hover,
.section-item:hover {
  background: #f8fafc;
}

.notebook-item.active,
.section-item.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
}

.section-item.child {
  padding-left: 28px;
}

.section-item.grandchild {
  padding-left: 48px;
}

.notebook-icon {
  font-size: 18px;
}

.notebook-name,
.section-name {
  flex: 1;
  font-size: 13px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 12px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  color: #64748b;
}

.expand-placeholder {
  width: 20px;
}

.section-add-child,
.note-add-child {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  opacity: 0;
  transition: all 0.2s ease;
}

.section-item:hover .section-add-child,
.note-item:hover .note-add-child {
  opacity: 1;
}

.section-add-child:hover,
.note-add-child:hover {
  color: var(--primary-color, #1e4d7b);
}

.notebook-delete,
.section-delete,
.note-delete {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  opacity: 0;
  transition: all 0.2s ease;
  font-size: 14px;
}

.notebook-item:hover .notebook-delete,
.section-item:hover .section-delete,
.note-item:hover .note-delete {
  opacity: 1;
}

.notebook-delete:hover,
.section-delete:hover,
.note-delete:hover {
  color: #ef4444;
}

.add-notebook-btn,
.add-section-btn,
.add-note-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #f8fafc;
  border: none;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-notebook-btn:hover,
.add-section-btn:hover,
.add-note-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.empty-section,
.empty-notes,
.empty-right,
.empty-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-content i {
  font-size: 48px;
  color: #cbd5e1;
}

.empty-content span {
  font-size: 15px;
  color: #94a3b8;
}

.create-note-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--primary-color, #1e4d7b);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.create-note-btn:hover {
  opacity: 0.9;
}

.empty-notes i {
  font-size: 32px;
  margin-bottom: 8px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 0 8px 8px;
  background: #f8fafc;
  border-radius: 8px;
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  font-size: 13px;
  outline: none;
}

.search-box i {
  color: #94a3b8;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  background: #f8fafc;
}

.note-item.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.note-item.child {
  padding-left: 28px;
}

.note-item.grandchild {
  padding-left: 48px;
}

.note-info {
  flex: 1;
  min-width: 0;
}

.note-title {
  font-size: 13px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-time {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

.section-children,
.note-children {
  overflow: hidden;
}

.quick-notebooks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.quick-notebook {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 20px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-notebook:hover {
  background: #f1f5f9;
}

.quick-notebook.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  color: var(--primary-color, #1e4d7b);
}

.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f8fafc;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f1f5f9;
}

.editor-title-wrapper {
  flex: 1;
}

.title-input {
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  border: none;
  outline: none;
  color: #334155;
  background: none;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-time {
  font-size: 12px;
  color: #94a3b8;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: var(--primary-color, #1e4d7b);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  opacity: 0.9;
}

.delete-btn {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  background: #fef2f2;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #fee2e2;
}

.editor-body {
  flex: 1;
  min-height: 300px;
}

.content-editor {
  width: 100%;
  height: 100%;
  min-height: 300px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
  resize: none;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.content-editor:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.editor-preview {
  margin-top: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.preview-header {
  margin-bottom: 10px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.preview-content {
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
}

.preview-content h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 10px;
}

.preview-content h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 14px 0 8px;
}

.preview-content h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 6px;
}

.preview-content strong {
  font-weight: 600;
}

.preview-content em {
  font-style: italic;
}

.preview-content code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.preview-content pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}

.preview-content pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.preview-content li {
  margin-left: 20px;
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
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.small {
  width: 360px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 18px;
  padding: 2px;
}

.modal-close:hover {
  color: #64748b;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  padding: 7px 16px;
  background: #f8fafc;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-confirm {
  padding: 7px 16px;
  background: var(--primary-color, #1e4d7b);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirm:hover {
  opacity: 0.9;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.form-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.form-textarea {
  width: 100%;
  height: 120px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: var(--primary-color, #1e4d7b);
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.emoji-btn:hover {
  border-color: var(--primary-color, #1e4d7b);
}

.emoji-btn.active {
  border-color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.color-picker {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #334155;
  transform: scale(1.1);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 12px;
  color: #64748b;
}

.tag-item button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.tag-item button:hover {
  color: #ef4444;
}

.wiki-link {
  color: var(--primary-color, #1e4d7b);
  text-decoration: underline;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  z-index: 2000;
  min-width: 140px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.context-menu-item:hover {
  background: #f1f5f9;
}

.context-menu-item i {
  font-size: 14px;
  color: #64748b;
}

.context-menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}
</style>