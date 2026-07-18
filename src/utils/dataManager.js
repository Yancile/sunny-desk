import { reactive } from 'vue'

const STORAGE_KEY_PREFIX = 'self_manage_system_data'
const USERS_STORAGE_KEY = 'self_manage_system_users'
const CURRENT_USER_ID_KEY = 'self_manage_system_current_user_id'

let currentUserId = null
let usersData = null

const setCurrentUserId = (userId) => {
  currentUserId = userId
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, userId)
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY)
    }
  } catch (error) {
    console.error('保存当前用户ID失败:', error)
  }
}

const restoreCurrentUserId = () => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_ID_KEY)
    if (stored) {
      currentUserId = stored
    }
  } catch (error) {
    console.error('恢复当前用户ID失败:', error)
  }
}

const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
    role: 'admin',
    status: 1,
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: '2',
    username: 'teacher001',
    password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
    role: 'teacher',
    status: 1,
    createTime: '2024-01-02 10:00:00'
  },
  {
    id: '3',
    username: 'student001',
    password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
    role: 'user',
    status: 1,
    createTime: '2024-01-03 14:00:00'
  },
  {
    id: '4',
    username: 'student002',
    password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
    role: 'user',
    status: 1,
    createTime: '2024-01-04 16:00:00'
  }
]

const loadUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      usersData = JSON.parse(stored)
    } else {
      usersData = JSON.parse(JSON.stringify(defaultUsers))
      saveUsers()
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    usersData = JSON.parse(JSON.stringify(defaultUsers))
    saveUsers()
  }
  return usersData
}

const saveUsers = () => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData))
  } catch (error) {
    console.error('保存用户数据失败:', error)
  }
}

restoreCurrentUserId()
loadUsers()

const getStorageKey = () => {
  if (currentUserId) {
    return `${STORAGE_KEY_PREFIX}_${currentUserId}`
  }
  return STORAGE_KEY_PREFIX
}

const defaultData = {
  todos: [
    { id: '1', title: '完成项目报告', description: '撰写项目总结报告', status: 'pending', priority: 'high', dueDate: '', createdAt: Date.now(), completedAt: null, category: '工作', tags: ['工作', '报告'] },
    { id: '2', title: '学习 Vue 3', description: '学习 Vue 3 Composition API', status: 'pending', priority: 'medium', dueDate: '', createdAt: Date.now(), completedAt: null, category: '学习', tags: ['学习', 'Vue'] },
    { id: '3', title: '阅读技术书籍', description: '阅读《深入浅出 Node.js》', status: 'completed', priority: 'low', dueDate: '', createdAt: Date.now(), completedAt: Date.now(), category: '阅读', tags: ['阅读', '技术'] }
  ],
  diaries: [
    { id: '1', date: new Date().toISOString().split('T')[0], content: '今天完成了项目的核心功能开发，感觉收获很大。', mood: 'happy', weather: 'sunny', createdAt: Date.now() }
  ],
  notes: [
    { id: '1', title: '技术笔记', content: '# Vue 3 笔记\n\n## Composition API\n\n- ref() - 响应式引用\n- reactive() - 响应式对象\n- computed() - 计算属性', createdAt: Date.now(), updatedAt: Date.now(), notebookId: '1', sectionId: '1' },
    { id: '2', title: '会议记录', content: '# 项目会议\n\n## 讨论内容\n\n1. 需求分析\n2. 技术方案\n3. 时间安排', createdAt: Date.now(), updatedAt: Date.now(), notebookId: '1', sectionId: '2' }
  ],
  notebooks: [
    { id: '1', name: '工作笔记', description: '工作相关的笔记', createdAt: Date.now(), updatedAt: Date.now() },
    { id: '2', name: '学习笔记', description: '学习相关的笔记', createdAt: Date.now(), updatedAt: Date.now() }
  ],
  sections: [
    { id: '1', name: '技术文档', notebookId: '1', createdAt: Date.now() },
    { id: '2', name: '会议记录', notebookId: '1', createdAt: Date.now() },
    { id: '3', name: 'Vue 学习', notebookId: '2', createdAt: Date.now() }
  ],
  bookmarks: [
    { id: '1', name: 'Vue 官方文档', url: 'https://vuejs.org/', description: 'Vue.js 官方文档', category: '技术', tags: ['Vue', '前端'], createdAt: Date.now() },
    { id: '2', name: 'GitHub', url: 'https://github.com/', description: '代码托管平台', category: '工具', tags: ['Git', '代码'], createdAt: Date.now() }
  ],
  categories: [
    { id: '1', name: '工作', color: '#3b82f6' },
    { id: '2', name: '学习', color: '#10b981' },
    { id: '3', name: '生活', color: '#f59e0b' },
    { id: '4', name: '阅读', color: '#8b5cf6' },
    { id: '5', name: '技术', color: '#ef4444' },
    { id: '6', name: '工具', color: '#6366f1' }
  ],
  goals: [
    { id: '1', title: '掌握 Vue 3', description: '熟练掌握 Vue 3 及其生态系统', targetDate: '', progress: 60, status: 'in_progress', createdAt: Date.now(), category: '学习', subGoals: [{ id: '1-1', title: '学习 Composition API', completed: true }, { id: '1-2', title: '学习 Pinia', completed: true }, { id: '1-3', title: '学习 Vue Router', completed: false }] },
    { id: '2', title: '每天运动', description: '每天坚持运动30分钟', targetDate: '', progress: 40, status: 'in_progress', createdAt: Date.now(), category: '生活', subGoals: [{ id: '2-1', title: '跑步', completed: true }, { id: '2-2', title: '健身', completed: false }] }
  ],
  memos: [
    { id: '1', content: '记得备份数据', color: 'yellow', createdAt: Date.now() },
    { id: '2', content: '明天开会', color: 'blue', createdAt: Date.now() }
  ],
  habits: [
    { id: '1', name: '早起', description: '每天7点前起床', frequency: 'daily', targetDays: 7, currentStreak: 3, completedDates: [new Date(Date.now() - 86400000).toISOString().split('T')[0], new Date(Date.now() - 172800000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]], createdAt: Date.now(), icon: 'sun' },
    { id: '2', name: '阅读', description: '每天阅读30分钟', frequency: 'daily', targetDays: 7, currentStreak: 5, completedDates: [], createdAt: Date.now(), icon: 'book' },
    { id: '3', name: '健身', description: '每周健身3次', frequency: 'weekly', targetDays: 3, currentStreak: 2, completedDates: [], createdAt: Date.now(), icon: 'dumbbell' }
  ],
  schedules: [
    { id: '1', title: '项目会议', description: '项目进度讨论', startTime: '09:00', endTime: '10:00', date: new Date().toISOString().split('T')[0], location: '会议室A', recurring: 'none', createdAt: Date.now() },
    { id: '2', title: '代码审查', description: '审查团队代码', startTime: '14:00', endTime: '16:00', date: new Date().toISOString().split('T')[0], location: '线上会议', recurring: 'none', createdAt: Date.now() }
  ],
  pomodoros: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    todaySessions: 0,
    totalSessions: 120
  },
  statistics: {
    todosCompleted: 156,
    diariesWritten: 42,
    notesCreated: 89,
    hoursStudied: 120,
    weeklyData: [
      { day: '周一', todos: 5, studyTime: 2 },
      { day: '周二', todos: 3, studyTime: 3 },
      { day: '周三', todos: 7, studyTime: 1 },
      { day: '周四', todos: 4, studyTime: 2.5 },
      { day: '周五', todos: 6, studyTime: 1.5 },
      { day: '周六', todos: 2, studyTime: 4 },
      { day: '周日', todos: 3, studyTime: 3 }
    ],
    monthlyData: [
      { month: '1月', todos: 45, studyTime: 30 },
      { month: '2月', todos: 38, studyTime: 25 },
      { month: '3月', todos: 52, studyTime: 35 },
      { month: '4月', todos: 48, studyTime: 32 },
      { month: '5月', todos: 55, studyTime: 38 },
      { month: '6月', todos: 42, studyTime: 28 }
    ],
    categoryStats: [
      { name: '工作', count: 65, color: '#3b82f6' },
      { name: '学习', count: 45, color: '#10b981' },
      { name: '生活', count: 30, color: '#f59e0b' },
      { name: '阅读', count: 25, color: '#8b5cf6' }
    ],
    goalProgress: [
      { name: '掌握 Vue 3', progress: 60, color: '#8b5cf6' },
      { name: '每天运动', progress: 40, color: '#10b981' },
      { name: '阅读计划', progress: 75, color: '#f59e0b' }
    ]
  },
  userProfile: {
    name: '',
    avatar: '',
    email: '',
    phone: '',
    bio: '',
    settings: {
      theme: 'light',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      notification: true,
      dailyReminder: true,
      reminderTime: '09:00'
    }
  },
  lastModifiedTime: Date.now(),
  syncVersion: 1,
  users: []
}

let appData = reactive(JSON.parse(JSON.stringify(defaultData)))

const loadData = () => {
  try {
    const stored = localStorage.getItem(getStorageKey())
    if (stored) {
      const parsed = JSON.parse(stored)
      const defaultCopy = JSON.parse(JSON.stringify(defaultData))
      appData = reactive({ ...defaultCopy, ...parsed })
      validateData()
    } else {
      const defaultCopy = JSON.parse(JSON.stringify(defaultData))
      appData = reactive(defaultCopy)
      saveData()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    const defaultCopy = JSON.parse(JSON.stringify(defaultData))
    appData = reactive(defaultCopy)
    saveData()
  }
  return appData
}

const validateData = () => {
  const defaults = defaultData
  const modules = ['todos', 'diaries', 'notes', 'goals', 'memos', 'notebooks', 'sections', 'habits', 'schedules', 'bookmarks', 'categories']

  modules.forEach(module => {
    if (!appData[module]) {
      appData[module] = JSON.parse(JSON.stringify(defaults[module]))
    }
  })

  if (!appData.userProfile) {
    appData.userProfile = JSON.parse(JSON.stringify(defaults.userProfile))
  }

  if (!appData.pomodoros) {
    appData.pomodoros = JSON.parse(JSON.stringify(defaults.pomodoros))
  }

  if (!appData.statistics) {
    appData.statistics = JSON.parse(JSON.stringify(defaults.statistics))
  }

  if (!appData.lastModifiedTime) {
    appData.lastModifiedTime = Date.now()
  }

  if (!appData.syncVersion) {
    appData.syncVersion = 1
  }
}

const setOnDataChangedCallback = (callback) => {
  onDataChangedCallback = callback
}

let onDataChangedCallback = null

const saveData = () => {
  try {
    if (!appData) {
      console.error('保存数据失败: appData 为空')
      return
    }
    appData.lastModifiedTime = Date.now()
    appData.syncVersion = (appData.syncVersion || 1) + 1
    localStorage.setItem(getStorageKey(), JSON.stringify(appData))
    if (onDataChangedCallback) {
      onDataChangedCallback()
    }
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

const getData = () => {
  if (!appData) {
    loadData()
  }
  return appData
}

const exportData = () => {
  return JSON.stringify(getData(), null, 2)
}

const importData = (dataString) => {
  try {
    const data = JSON.parse(dataString)
    if (data.todos && data.diaries) {
      const importDataCopy = { ...data }
      delete importDataCopy.users
      appData = reactive(importDataCopy)
      saveData()
      return true
    }
    return false
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}

const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

const getUsers = () => {
  if (!usersData) {
    loadUsers()
  }
  return usersData
}

const updateUsers = (newUsers) => {
  usersData = newUsers
  saveUsers()
}

const userModule = {
  getAll: () => {
    return getUsers().slice().reverse()
  },
  getById: (id) => {
    return getUsers().find(u => String(u.id) === String(id))
  },
  getByUsername: (username) => {
    return getUsers().find(u => u.username === username)
  },
  add: (user) => {
    const newUser = {
      ...user,
      id: generateId(),
      status: 1,
      createTime: new Date().toLocaleString('zh-CN')
    }
    const users = getUsers()
    users.push(newUser)
    updateUsers(users)
    return newUser
  },
  update: (user) => {
    const users = getUsers()
    const index = users.findIndex(u => String(u.id) === String(user.id))
    if (index !== -1) {
      users[index] = { ...users[index], ...user, updateTime: new Date().toLocaleString('zh-CN') }
      updateUsers(users)
      return users[index]
    }
    return null
  },
  delete: (id) => {
    const users = getUsers().filter(u => String(u.id) !== String(id))
    updateUsers(users)
  },
  validateLogin: (username, password) => {
    const bcrypt = require('bcryptjs')
    const user = getUsers().find(u => u.username === username && u.status === 1)
    if (user && bcrypt.compareSync(password, user.password)) {
      return user
    }
    return null
  },
  changePassword: (userId, oldPassword, newPassword) => {
    const bcrypt = require('bcryptjs')
    const users = getUsers()
    const user = users.find(u => String(u.id) === String(userId))
    if (user) {
      try {
        if (bcrypt.compareSync(oldPassword, user.password)) {
          user.password = bcrypt.hashSync(newPassword, 10)
          updateUsers(users)
          return { success: true, message: '密码修改成功' }
        }
      } catch (e) {
        console.error('密码验证失败:', e)
      }
    }
    return { success: false, message: '旧密码不正确' }
  },
  search: (params) => {
    let users = getUsers().slice().reverse()
    if (params.username) {
      users = users.filter(u => u.username.includes(params.username))
    }
    if (params.role) {
      users = users.filter(u => u.role === params.role)
    }
    const total = users.length
    const start = (params.page - 1) * params.limit
    const end = start + params.limit
    return {
      list: users.slice(start, end),
      total
    }
  }
}

const todoModule = {
  getAll: () => {
    return [...getData().todos]
  },
  getById: (id) => {
    return getData().todos.find(t => String(t.id) === String(id))
  },
  add: (todo) => {
    const newTodo = {
      ...todo,
      id: generateId(),
      status: 'pending'
    }
    getData().todos.push(newTodo)
    saveData()
    return newTodo
  },
  update: (todo) => {
    const index = getData().todos.findIndex(t => String(t.id) === String(todo.id))
    if (index !== -1) {
      getData().todos[index] = { ...getData().todos[index], ...todo }
      if (todo.status === 'completed' && !getData().todos[index].completedAt) {
        getData().todos[index].completedAt = Date.now()
      } else if (todo.status !== 'completed') {
        getData().todos[index].completedAt = null
      }
      saveData()
      return getData().todos[index]
    }
    return null
  },
  delete: (id) => {
    getData().todos = getData().todos.filter(t => String(t.id) !== String(id))
    saveData()
  },
  toggle: (id) => {
    const todo = getData().todos.find(t => String(t.id) === String(id))
    if (todo) {
      todo.status = todo.status === 'completed' ? 'pending' : 'completed'
      todo.completedAt = todo.status === 'completed' ? Date.now() : null
      saveData()
    }
  }
}

const diaryModule = {
  getAll: () => {
    return [...getData().diaries].sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  getById: (id) => {
    return getData().diaries.find(d => String(d.id) === String(id))
  },
  getByDate: (date) => {
    return getData().diaries.find(d => d.date === date)
  },
  add: (diary) => {
    const newDiary = {
      ...diary,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().diaries.push(newDiary)
    saveData()
    return newDiary
  },
  update: (diary) => {
    const index = getData().diaries.findIndex(d => String(d.id) === String(diary.id))
    if (index !== -1) {
      getData().diaries[index] = { ...getData().diaries[index], ...diary }
      saveData()
      return getData().diaries[index]
    }
    return null
  },
  delete: (id) => {
    getData().diaries = getData().diaries.filter(d => String(d.id) !== String(id))
    saveData()
  }
}

const noteModule = {
  getAll: () => {
    return [...getData().notes].sort((a, b) => b.updatedAt - a.updatedAt)
  },
  getById: (id) => {
    return getData().notes.find(n => String(n.id) === String(id))
  },
  getByNotebook: (notebookId) => {
    return getData().notes.filter(n => String(n.notebookId) === String(notebookId))
  },
  add: (note) => {
    const newNote = {
      ...note,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    getData().notes.push(newNote)
    saveData()
    return newNote
  },
  update: (note) => {
    const index = getData().notes.findIndex(n => String(n.id) === String(note.id))
    if (index !== -1) {
      getData().notes[index] = { ...getData().notes[index], ...note, updatedAt: Date.now() }
      saveData()
      return getData().notes[index]
    }
    return null
  },
  delete: (id) => {
    getData().notes = getData().notes.filter(n => String(n.id) !== String(id))
    saveData()
  }
}

const bookmarkModule = {
  getAll: () => {
    return [...getData().bookmarks].sort((a, b) => b.createdAt - a.createdAt)
  },
  getById: (id) => {
    return getData().bookmarks.find(b => String(b.id) === String(id))
  },
  getByCategory: (category) => {
    return getData().bookmarks.filter(b => b.category === category)
  },
  add: (bookmark) => {
    const newBookmark = {
      ...bookmark,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().bookmarks.push(newBookmark)
    saveData()
    return newBookmark
  },
  update: (bookmark) => {
    const index = getData().bookmarks.findIndex(b => String(b.id) === String(bookmark.id))
    if (index !== -1) {
      getData().bookmarks[index] = { ...getData().bookmarks[index], ...bookmark }
      saveData()
      return getData().bookmarks[index]
    }
    return null
  },
  delete: (id) => {
    getData().bookmarks = getData().bookmarks.filter(b => String(b.id) !== String(id))
    saveData()
  }
}

const categoryModule = {
  getAll: () => {
    return [...getData().categories]
  },
  getById: (id) => {
    return getData().categories.find(c => String(c.id) === String(id))
  },
  add: (category) => {
    const newCategory = {
      ...category,
      id: generateId()
    }
    getData().categories.push(newCategory)
    saveData()
    return newCategory
  },
  update: (category) => {
    const index = getData().categories.findIndex(c => String(c.id) === String(category.id))
    if (index !== -1) {
      getData().categories[index] = { ...getData().categories[index], ...category }
      saveData()
      return getData().categories[index]
    }
    return null
  },
  delete: (id) => {
    getData().categories = getData().categories.filter(c => String(c.id) !== String(id))
    saveData()
  }
}

const goalModule = {
  getAll: () => {
    return [...getData().goals]
  },
  getById: (id) => {
    return getData().goals.find(g => String(g.id) === String(id))
  },
  add: (goal) => {
    const newGoal = {
      ...goal,
      id: generateId(),
      progress: 0,
      status: 'in_progress',
      createdAt: Date.now()
    }
    getData().goals.push(newGoal)
    saveData()
    return newGoal
  },
  update: (goal) => {
    const index = getData().goals.findIndex(g => String(g.id) === String(goal.id))
    if (index !== -1) {
      getData().goals[index] = { ...getData().goals[index], ...goal }
      saveData()
      return getData().goals[index]
    }
    return null
  },
  delete: (id) => {
    getData().goals = getData().goals.filter(g => String(g.id) !== String(id))
    saveData()
  },
  toggleSubGoal: (goalId, subGoalId) => {
    const goal = getData().goals.find(g => String(g.id) === String(goalId))
    if (goal && goal.subGoals) {
      const subGoal = goal.subGoals.find(sg => String(sg.id) === String(subGoalId))
      if (subGoal) {
        subGoal.completed = !subGoal.completed
        const completedCount = goal.subGoals.filter(sg => sg.completed).length
        goal.progress = goal.subGoals.length > 0 ? Math.round((completedCount / goal.subGoals.length) * 100) : 0
        goal.status = goal.progress === 100 ? 'completed' : 'in_progress'
        saveData()
      }
    }
  }
}

const memoModule = {
  getAll: () => {
    return [...getData().memos].sort((a, b) => b.createdAt - a.createdAt)
  },
  getById: (id) => {
    return getData().memos.find(m => String(m.id) === String(id))
  },
  add: (memo) => {
    const newMemo = {
      ...memo,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().memos.push(newMemo)
    saveData()
    return newMemo
  },
  update: (memo) => {
    const index = getData().memos.findIndex(m => String(m.id) === String(memo.id))
    if (index !== -1) {
      getData().memos[index] = { ...getData().memos[index], ...memo }
      saveData()
      return getData().memos[index]
    }
    return null
  },
  delete: (id) => {
    getData().memos = getData().memos.filter(m => String(m.id) !== String(id))
    saveData()
  }
}

const notebookModule = {
  getAll: () => {
    return [...getData().notebooks].sort((a, b) => b.updatedAt - a.updatedAt)
  },
  getById: (id) => {
    return getData().notebooks.find(n => String(n.id) === String(id))
  },
  add: (notebook) => {
    const newNotebook = {
      ...notebook,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    getData().notebooks.push(newNotebook)
    saveData()
    return newNotebook
  },
  update: (notebook) => {
    const index = getData().notebooks.findIndex(n => String(n.id) === String(notebook.id))
    if (index !== -1) {
      getData().notebooks[index] = { ...getData().notebooks[index], ...notebook, updatedAt: Date.now() }
      saveData()
      return getData().notebooks[index]
    }
    return null
  },
  delete: (id) => {
    getData().notebooks = getData().notebooks.filter(n => String(n.id) !== String(id))
    getData().notes = getData().notes.filter(n => String(n.notebookId) !== String(id))
    getData().sections = getData().sections.filter(s => String(s.notebookId) !== String(id))
    saveData()
  }
}

const sectionModule = {
  getAll: () => {
    return [...getData().sections]
  },
  getById: (id) => {
    return getData().sections.find(s => String(s.id) === String(id))
  },
  getByNotebook: (notebookId) => {
    return getData().sections.filter(s => String(s.notebookId) === String(notebookId))
  },
  add: (section) => {
    const newSection = {
      ...section,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().sections.push(newSection)
    saveData()
    return newSection
  },
  update: (section) => {
    const index = getData().sections.findIndex(s => String(s.id) === String(section.id))
    if (index !== -1) {
      getData().sections[index] = { ...getData().sections[index], ...section }
      saveData()
      return getData().sections[index]
    }
    return null
  },
  delete: (id) => {
    getData().sections = getData().sections.filter(s => String(s.id) !== String(id))
    getData().notes = getData().notes.filter(n => String(n.sectionId) !== String(id))
    saveData()
  }
}

const habitModule = {
  getAll: () => {
    return [...getData().habits]
  },
  getById: (id) => {
    return getData().habits.find(h => String(h.id) === String(id))
  },
  add: (habit) => {
    const newHabit = {
      ...habit,
      id: generateId(),
      currentStreak: 0,
      completedDates: [],
      createdAt: Date.now()
    }
    getData().habits.push(newHabit)
    saveData()
    return newHabit
  },
  update: (habit) => {
    const index = getData().habits.findIndex(h => String(h.id) === String(habit.id))
    if (index !== -1) {
      getData().habits[index] = { ...getData().habits[index], ...habit }
      saveData()
      return getData().habits[index]
    }
    return null
  },
  delete: (id) => {
    getData().habits = getData().habits.filter(h => String(h.id) !== String(id))
    saveData()
  },
  toggleToday: (id) => {
    const habit = getData().habits.find(h => String(h.id) === String(id))
    if (habit) {
      const today = new Date().toISOString().split('T')[0]
      const dateIndex = habit.completedDates.indexOf(today)
      if (dateIndex === -1) {
        habit.completedDates.push(today)
        habit.currentStreak++
      } else {
        habit.completedDates.splice(dateIndex, 1)
        habit.currentStreak = Math.max(0, habit.currentStreak - 1)
      }
      saveData()
    }
  },
  isCompletedToday: (id) => {
    const habit = getData().habits.find(h => String(h.id) === String(id))
    if (habit) {
      const today = new Date().toISOString().split('T')[0]
      return habit.completedDates.includes(today)
    }
    return false
  }
}

const scheduleModule = {
  getAll: () => {
    return [...getData().schedules].sort((a, b) => {
      if (a.date !== b.date) return new Date(a.date) - new Date(b.date)
      return a.startTime.localeCompare(b.startTime)
    })
  },
  getById: (id) => {
    return getData().schedules.find(s => String(s.id) === String(id))
  },
  getByDate: (date) => {
    return getData().schedules.filter(s => s.date === date)
  },
  add: (schedule) => {
    const newSchedule = {
      ...schedule,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().schedules.push(newSchedule)
    saveData()
    return newSchedule
  },
  update: (schedule) => {
    const index = getData().schedules.findIndex(s => String(s.id) === String(schedule.id))
    if (index !== -1) {
      getData().schedules[index] = { ...getData().schedules[index], ...schedule }
      saveData()
      return getData().schedules[index]
    }
    return null
  },
  delete: (id) => {
    getData().schedules = getData().schedules.filter(s => String(s.id) !== String(id))
    saveData()
  }
}

const syncModule = {
  getSyncVersion: () => {
    return getData().syncVersion || 1
  },
  getLastModifiedTime: () => {
    return getData().lastModifiedTime || Date.now()
  },
  incrementVersion: () => {
    getData().syncVersion = (getData().syncVersion || 1) + 1
    getData().lastModifiedTime = Date.now()
    saveData()
  }
}

const errorbookModule = {
  getAll: () => {
    return [...(getData().errorbook || [])].sort((a, b) => b.createdAt - a.createdAt)
  },
  getById: (id) => {
    return (getData().errorbook || []).find(e => String(e.id) === String(id))
  },
  add: (error) => {
    if (!getData().errorbook) {
      getData().errorbook = []
    }
    const newError = {
      ...error,
      id: generateId(),
      createdAt: Date.now(),
      reviewed: false,
      reviewCount: 0
    }
    getData().errorbook.push(newError)
    saveData()
    return newError
  },
  update: (error) => {
    if (!getData().errorbook) return null
    const index = getData().errorbook.findIndex(e => String(e.id) === String(error.id))
    if (index !== -1) {
      getData().errorbook[index] = { ...getData().errorbook[index], ...error }
      saveData()
      return getData().errorbook[index]
    }
    return null
  },
  delete: (id) => {
    if (getData().errorbook) {
      getData().errorbook = getData().errorbook.filter(e => String(e.id) !== String(id))
      saveData()
    }
  },
  review: (id) => {
    const error = (getData().errorbook || []).find(e => String(e.id) === String(id))
    if (error) {
      error.reviewed = true
      error.reviewCount = (error.reviewCount || 0) + 1
      error.lastReviewTime = Date.now()
      saveData()
      return error
    }
    return null
  },
  getBySubject: (subjectId) => {
    return (getData().errorbook || []).filter(e => String(e.subjectId) === String(subjectId))
  },
  getByTag: (tagId) => {
    return (getData().errorbook || []).filter(e => (e.tags || []).includes(tagId))
  }
}

const subjectBookModule = {
  getAll: () => {
    return [...(getData().subjectBooks || [])]
  },
  getById: (id) => {
    return (getData().subjectBooks || []).find(s => String(s.id) === String(id))
  },
  add: (subject) => {
    if (!getData().subjectBooks) {
      getData().subjectBooks = []
    }
    const newSubject = {
      ...subject,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().subjectBooks.push(newSubject)
    saveData()
    return newSubject
  },
  update: (subject) => {
    if (!getData().subjectBooks) return null
    const index = getData().subjectBooks.findIndex(s => String(s.id) === String(subject.id))
    if (index !== -1) {
      getData().subjectBooks[index] = { ...getData().subjectBooks[index], ...subject }
      saveData()
      return getData().subjectBooks[index]
    }
    return null
  },
  delete: (id) => {
    if (getData().subjectBooks) {
      getData().subjectBooks = getData().subjectBooks.filter(s => String(s.id) !== String(id))
      saveData()
    }
  }
}

const errorbookTagModule = {
  getAll: () => {
    return [...(getData().errorbookTags || [])]
  },
  getById: (id) => {
    return (getData().errorbookTags || []).find(t => String(t.id) === String(id))
  },
  add: (tag) => {
    if (!getData().errorbookTags) {
      getData().errorbookTags = []
    }
    const newTag = {
      ...tag,
      id: generateId(),
      createdAt: Date.now()
    }
    getData().errorbookTags.push(newTag)
    saveData()
    return newTag
  },
  update: (tag) => {
    if (!getData().errorbookTags) return null
    const index = getData().errorbookTags.findIndex(t => String(t.id) === String(tag.id))
    if (index !== -1) {
      getData().errorbookTags[index] = { ...getData().errorbookTags[index], ...tag }
      saveData()
      return getData().errorbookTags[index]
    }
    return null
  },
  delete: (id) => {
    if (getData().errorbookTags) {
      getData().errorbookTags = getData().errorbookTags.filter(t => String(t.id) !== String(id))
      saveData()
    }
  }
}

const errorbookConfigModule = {
  get: () => {
    return getData().errorbookConfig || {}
  },
  set: (config) => {
    getData().errorbookConfig = config
    saveData()
  },
  update: (updates) => {
    getData().errorbookConfig = { ...(getData().errorbookConfig || {}), ...updates }
    saveData()
  }
}

export const dataManager = {
  users: userModule,
  todos: todoModule,
  diaries: diaryModule,
  notes: noteModule,
  notebooks: notebookModule,
  sections: sectionModule,
  bookmarks: bookmarkModule,
  categories: categoryModule,
  goals: goalModule,
  memos: memoModule,
  habits: habitModule,
  schedules: scheduleModule,
  sync: syncModule,
  errorbook: errorbookModule,
  subjectBooks: subjectBookModule,
  errorbookTags: errorbookTagModule,
  errorbookConfig: errorbookConfigModule,
  getData,
  saveData,
  loadData,
  exportData,
  importData,
  validateData,
  setOnDataChangedCallback,
  setCurrentUserId,
  getStorageKey,
  currentUserId: () => currentUserId
}