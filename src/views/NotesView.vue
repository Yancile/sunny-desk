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
      <div class="column-left">
        <div class="column-header">
          <span class="column-title">笔记本</span>
          <span>
            <button v-if="selectedNotebook" class="add-section-btn"
              @click="showSectionModal = true; parentSectionId = null">
              <i class="layui-icon layui-icon-add-1"></i>
              +
            </button>
          </span>
        </div>
        <div class="notebook-list">
          <div v-for="notebook in notebooks" :key="notebook.id" class="notebook-item"
            :class="{ active: selectedNotebook?.id === notebook.id }" @click="selectNotebook(notebook)"
            @contextmenu.prevent="showNotebookContextMenu($event, notebook)">
            <span class="notebook-icon">{{ notebook.icon }}</span>
            <span class="notebook-name">{{ notebook.name }}</span>
          </div>
        </div>
      </div>

      <div class="column-middle">
        <div class="column-header">
          <span class="column-title">分区</span>
          <span>
            <button v-if="selectedNotebook" class="add-section-btn"
              @click="showSectionModal = true; parentSectionId = null">
              <i class="layui-icon layui-icon-add-1"></i>
              +
            </button>
          </span>
        </div>
        <div class="section-tree" v-if="selectedNotebook">
          <div v-for="section in rootSections" :key="section.id">
            <div class="section-node">
              <div class="section-item" :class="{ active: selectedSection?.id === section.id }"
                @click="selectSection(section)" @contextmenu.prevent="showSectionContextMenu($event, section)">
                <button v-if="hasChildren(section.id)" class="expand-btn" @click.stop="toggleSectionExpand(section.id)">
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
                        <div class="section-item grandchild" :class="{ active: selectedSection?.id === grandchild.id }"
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
            </div>
          </div>
        </div>
        <div v-else class="empty-section">
          <span>请选择笔记本</span>
        </div>
      </div>

      <div class="column-right">
        <div class="column-header">
          <span class="column-title">笔记列表</span>
        </div>
        <div class="search-box" v-if="selectedSection">
          <i class="layui-icon layui-icon-search"></i>
          <input type="text" v-model="searchKeyword" placeholder="搜索笔记..." />
        </div>
        <div class="note-tree" v-if="selectedSection">
          <div v-for="note in rootNotes" :key="note.id">
            <div class="note-node">
              <div class="note-item" :class="{ active: selectedNote?.id === note.id }" @click="selectNote(note)">
                <button v-if="hasNoteChildren(note.id)" class="expand-btn" @click.stop="toggleNoteExpand(note.id)">
                  <i class="layui-icon"
                    :class="expandedNotes.includes(note.id) ? 'layui-icon-down' : 'layui-icon-right'"></i>
                </button>
                <span v-else class="expand-placeholder"></span>
                <div class="note-info">
                  <div class="note-title">{{ note.title || '无标题' }}</div>
                  <div class="note-time">{{ formatDate(note.createdAt) }}</div>
                </div>
                <button class="note-add-child" @click.stop="showAddSubNote(note)">
                  <i class="layui-icon layui-icon-add-1"></i>
                </button>
              </div>
              <div v-if="expandedNotes.includes(note.id)" class="note-children">
                <div v-for="child in getNoteChildren(note.id)" :key="child.id">
                  <div class="note-node">
                    <div class="note-item child" :class="{ active: selectedNote?.id === child.id }"
                      @click="selectNote(child)">
                      <button v-if="hasNoteChildren(child.id)" class="expand-btn"
                        @click.stop="toggleNoteExpand(child.id)">
                        <i class="layui-icon"
                          :class="expandedNotes.includes(child.id) ? 'layui-icon-down' : 'layui-icon-right'"></i>
                      </button>
                      <span v-else class="expand-placeholder"></span>
                      <div class="note-info">
                        <div class="note-title">{{ child.title || '无标题' }}</div>
                        <div class="note-time">{{ formatDate(child.createdAt) }}</div>
                      </div>
                      <button class="note-add-child" @click.stop="showAddSubNote(child)">
                        <i class="layui-icon layui-icon-add-1"></i>
                      </button>
                    </div>
                    <div v-if="expandedNotes.includes(child.id)" class="note-children">
                      <div v-for="grandchild in getNoteChildren(child.id)" :key="grandchild.id">
                        <div class="note-item grandchild" :class="{ active: selectedNote?.id === grandchild.id }"
                          @click="selectNote(grandchild)">
                          <span class="expand-placeholder"></span>
                          <div class="note-info">
                            <div class="note-title">{{ grandchild.title || '无标题' }}</div>
                            <div class="note-time">{{ formatDate(grandchild.createdAt) }}</div>
                          </div>
                          <button class="note-add-child" @click.stop="showAddSubNote(grandchild)">
                            <i class="layui-icon layui-icon-add-1"></i>
                          </button>
                          <button class="note-delete" @click.stop="deleteNote(grandchild.id)">
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
          <div v-if="rootNotes.length === 0" class="empty-notes">
            <i class="layui-icon layui-icon-file"></i>
            <span>暂无笔记</span>
          </div>
        </div>
        <div v-else-if="selectedNotebook" class="empty-right">
          <span>请选择分区</span>
          <div class="quick-notebooks">
            <div v-for="nb in notebooks" :key="nb.id" class="quick-notebook"
              :class="{ active: selectedNotebook?.id === nb.id }" @click="selectNotebook(nb)">
              <span>{{ nb.icon }}</span>
              <span>{{ nb.name }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-right">
          <span>请选择笔记本</span>
        </div>
      </div>
    </div>

    <div class="editor-area" v-if="selectedNote">
      <div class="editor-header">
        <button class="back-btn" @click="selectedNote = null">
          <i class="layui-icon layui-icon-left"></i>
          返回列表
        </button>
        <div class="editor-title-wrapper">
          <input type="text" v-model="selectedNote.title" class="title-input" placeholder="笔记标题" />
        </div>
        <div class="editor-actions">
          <span class="update-time">更新于 {{ formatDateTime(selectedNote.updatedAt || selectedNote.createdAt) }}</span>
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
      <template v-else>
        <div class="context-menu-item" @click="handleContextMenuAddSubFolder">
          <i class="layui-icon layui-icon-add-1"></i>
          <span>新建子文件夹</span>
        </div>
        <div class="context-menu-item" @click="handleContextMenuAddNote">
          <i class="layui-icon layui-icon-add-circle"></i>
          <span>新建笔记</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()

const notebooks = ref([
  { id: 1, name: '数据结构', icon: '📘', color: '#3b82f6' },
  { id: 2, name: '组成原理', icon: '📗', color: '#10b981' },
  { id: 3, name: '408', icon: '📕', color: '#ef4444' },
  { id: 4, name: '英语', icon: '📙', color: '#f59e0b' },
])

const sections = ref([
  { id: 1, notebookId: 1, parentId: null, name: '第一章' },
  { id: 2, notebookId: 1, parentId: null, name: '第二章' },
  { id: 3, notebookId: 1, parentId: null, name: '第三章' },
  { id: 4, notebookId: 1, parentId: null, name: '第四章' },
  { id: 5, notebookId: 1, parentId: null, name: '第五章' },
  { id: 6, notebookId: 1, parentId: null, name: '第六章' },
  { id: 7, notebookId: 1, parentId: null, name: '第七章' },
  { id: 8, notebookId: 2, parentId: null, name: '第一章 计算机系统概述' },
  { id: 9, notebookId: 2, parentId: null, name: '第二章 数据的表示和运算' },
  { id: 10, notebookId: 2, parentId: null, name: '第三章 存储器层次结构' },
  { id: 11, notebookId: 1, parentId: 1, name: '1.1 数据结构的基本概念' },
  { id: 12, notebookId: 1, parentId: 1, name: '1.2 算法和算法分析' },
  { id: 13, notebookId: 1, parentId: 2, name: '2.1 线性表的定义和特点' },
  { id: 14, notebookId: 1, parentId: 2, name: '2.2 线性表的顺序表示' },
  { id: 15, notebookId: 1, parentId: 11, name: '1.1.1 数据' },
])

const notes = ref([
  { id: 1, title: '第一章概述', notebookId: 1, sectionId: 1, parentId: null, content: '# 第一章概述\n\n## 数据结构的基本概念\n\n数据结构是计算机存储、组织数据的方式。\n\n### 基本术语\n\n- 数据\n- 数据元素\n- 数据项', tags: [], createdAt: '2026-04-22T22:46', updatedAt: '2026-04-22T22:46' },
  { id: 2, title: '数据的定义', notebookId: 1, sectionId: 1, parentId: 1, content: '# 数据的定义\n\n数据是描述客观事物的符号，是计算机中可以操作的对象。', tags: [], createdAt: '2026-04-22T22:50', updatedAt: '2026-04-22T22:50' },
  { id: 3, title: '数据元素', notebookId: 1, sectionId: 1, parentId: 1, content: '# 数据元素\n\n数据元素是数据的基本单位，在计算机程序中通常作为一个整体进行考虑和处理。', tags: [], createdAt: '2026-04-22T22:52', updatedAt: '2026-04-22T22:52' },
  { id: 4, title: '第二章线性表', notebookId: 1, sectionId: 2, parentId: null, content: '# 第二章线性表\n\n## 线性表的定义\n\n线性表是具有相同特性的数据元素的一个有限序列。', tags: [], createdAt: '2026-04-25T14:30', updatedAt: '2026-04-25T14:30' },
  { id: 5, title: '线性表的顺序存储', notebookId: 1, sectionId: 2, parentId: 4, content: '# 线性表的顺序存储\n\n用一组地址连续的存储单元依次存储线性表的数据元素。', tags: [], createdAt: '2026-04-25T14:40', updatedAt: '2026-04-25T14:40' },
  { id: 6, title: '第三章栈和队列', notebookId: 1, sectionId: 3, parentId: null, content: '# 第三章栈和队列\n\n## 栈\n\n栈是一种特殊的线性表，只能在一端进行插入和删除操作。', tags: [], createdAt: '2026-04-28T10:15', updatedAt: '2026-04-28T10:15' },
  { id: 7, title: '计算机系统概述', notebookId: 2, sectionId: 8, parentId: null, content: '# 第一章 计算机系统概述\n\n## 冯·诺依曼结构\n\n冯·诺依曼计算机由五大部件组成。', tags: [], createdAt: '2026-05-01T09:00', updatedAt: '2026-05-01T09:00' },
  { id: 8, title: '数据的表示和运算', notebookId: 2, sectionId: 9, parentId: null, content: '# 第二章 数据的表示和运算\n\n## 数制转换\n\n二进制、八进制、十进制、十六进制之间的转换方法。', tags: [], createdAt: '2026-05-05T16:20', updatedAt: '2026-05-05T16:20' },
])

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

const editingNotebook = ref(null)
const editingSection = ref(null)

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  type: 'section',
  section: null,
  notebook: null
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
  selectedSection.value = section
}

const closeContextMenu = () => {
  contextMenu.show = false
  contextMenu.section = null
  contextMenu.notebook = null
}

const handleContextMenuEdit = () => {
  if (contextMenu.type === 'notebook' && contextMenu.notebook) {
    editNotebook(contextMenu.notebook)
  } else if (contextMenu.type === 'section' && contextMenu.section) {
    editSection(contextMenu.section)
  }
  closeContextMenu()
}

const handleContextMenuDelete = () => {
  if (contextMenu.type === 'notebook' && contextMenu.notebook) {
    deleteNotebook(contextMenu.notebook.id)
  } else if (contextMenu.type === 'section' && contextMenu.section) {
    deleteSection(contextMenu.section.id)
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
    const index = notes.value.findIndex(n => n.id === editingNote.value.id)
    if (index !== -1) {
      notes.value[index] = {
        ...formData,
        id: editingNote.value.id,
        notebookId: notebookId || editingNote.value.notebookId,
        sectionId: sectionId || editingNote.value.sectionId,
        createdAt: editingNote.value.createdAt,
        updatedAt: new Date().toISOString()
      }
      selectedNote.value = notes.value[index]
      layer.msg('修改成功', { icon: 1 })
    }
  } else {
    const newNote = {
      ...formData,
      notebookId: notebookId,
      sectionId: sectionId,
      id: Date.now(),
      parentId: parentNoteId.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    notes.value.push(newNote)
    selectedNote.value = newNote

    if (!selectedNotebook.value && notebookId) {
      selectedNotebook.value = notebooks.value.find(n => n.id === notebookId) || null
    }
    if (!selectedSection.value && sectionId) {
      selectedSection.value = sections.value.find(s => s.id === sectionId) || null
    }

    layer.msg('创建成功', { icon: 1 })
  }
  closeNoteModal()
}

const saveCurrentNote = () => {
  if (selectedNote.value) {
    selectedNote.value.updatedAt = new Date().toISOString()
    layer.msg('保存成功', { icon: 1 })
  }
}

const deleteNote = (id) => {
  const hasChildren = notes.value.some(n => n.parentId === id)
  if (hasChildren) {
    layer.confirm('该笔记有子笔记，确定删除吗？子笔记将变为顶级笔记。', { icon: 3 }, () => {
      notes.value.forEach(n => {
        if (n.parentId === id) {
          n.parentId = null
        }
      })
      const index = notes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notes.value.splice(index, 1)
        selectedNote.value = null
        layer.msg('删除成功', { icon: 1 })
      }
    })
  } else {
    layer.confirm('确定删除该笔记吗？', { icon: 3 }, () => {
      const index = notes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notes.value.splice(index, 1)
        selectedNote.value = null
        layer.msg('删除成功', { icon: 1 })
      }
    })
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
    const index = notebooks.value.findIndex(n => n.id === editingNotebook.value.id)
    if (index !== -1) {
      notebooks.value[index] = { ...notebooks.value[index], ...notebookForm }
      selectedNotebook.value = notebooks.value[index]
      layer.msg('修改成功', { icon: 1 })
    }
  } else {
    const newNotebook = {
      ...notebookForm,
      id: Date.now()
    }
    notebooks.value.push(newNotebook)
    selectedNotebook.value = newNotebook
    layer.msg('创建成功', { icon: 1 })
  }
  closeNotebookModal()
}

const deleteNotebook = (id) => {
  layer.confirm('确定删除该笔记本吗？所有分区和笔记将被删除。', { icon: 3 }, () => {
    const index = notebooks.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notebooks.value.splice(index, 1)
      sections.value = sections.value.filter(s => s.notebookId !== id)
      notes.value = notes.value.filter(n => n.notebookId !== id)
      if (selectedNotebook.value?.id === id) {
        selectedNotebook.value = null
        selectedSection.value = null
        selectedNote.value = null
      }
      layer.msg('删除成功', { icon: 1 })
    }
  })
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
    const index = sections.value.findIndex(s => s.id === editingSection.value.id)
    if (index !== -1) {
      sections.value[index] = { ...sections.value[index], name: sectionForm.name }
      selectedSection.value = sections.value[index]
      layer.msg('修改成功', { icon: 1 })
    }
  } else {
    sections.value.push({
      ...sectionForm,
      id: Date.now(),
      notebookId: selectedNotebook.value.id,
      parentId: parentSectionId.value
    })
    layer.msg('创建成功', { icon: 1 })
  }
  closeSectionModal()
}

const deleteSection = (id) => {
  const hasChildren = sections.value.some(s => s.parentId === id)
  if (hasChildren) {
    layer.confirm('该分区有子分区，确定删除吗？子分区将变为顶级分区。', { icon: 3 }, () => {
      sections.value.forEach(s => {
        if (s.parentId === id) {
          s.parentId = null
        }
      })
      const index = sections.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sections.value.splice(index, 1)
        notes.value.forEach(n => {
          if (n.sectionId === id) {
            n.sectionId = null
          }
        })
        if (selectedSection.value?.id === id) {
          selectedSection.value = null
          selectedNote.value = null
        }
        layer.msg('删除成功', { icon: 1 })
      }
    })
  } else {
    layer.confirm('确定删除该分区吗？所有笔记将被移到未分类。', { icon: 3 }, () => {
      const index = sections.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sections.value.splice(index, 1)
        notes.value.forEach(n => {
          if (n.sectionId === id) {
            n.sectionId = null
          }
        })
        if (selectedSection.value?.id === id) {
          selectedSection.value = null
          selectedNote.value = null
        }
        layer.msg('删除成功', { icon: 1 })
      }
    })
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

.column-left,
.column-middle,
.column-right {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-left {
  width: 180px;
}

.column-middle {
  width: 200px;
}

.column-right {
  flex: 1;
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
.empty-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
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

.editor-area {
  margin-top: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
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