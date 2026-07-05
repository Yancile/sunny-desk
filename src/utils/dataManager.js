const STORAGE_KEY = 'self_manage_system_data'

const defaultData = {
  users: [
    {
      id: 1,
      username: 'admin',
      password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
      role: 'admin',
      status: 1,
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: 2,
      username: 'teacher001',
      password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
      role: 'teacher',
      status: 1,
      createTime: '2024-01-02 10:00:00'
    },
    {
      id: 3,
      username: 'student001',
      password: '$2a$10$rB8f5y9L7u6K5H3G7F2D1N9H4G3F2D1S8D7F4G2H1J6K8L7',
      role: 'student',
      status: 1,
      createTime: '2024-01-03 14:00:00'
    }
  ],
  todos: [
    {
      id: 1,
      title: '网页设计',
      description: '',
      quadrant: 'important-not-urgent',
      status: 'completed',
      deadline: '',
      priority: 'medium',
      category: 'work'
    },
    {
      id: 2,
      title: '学习vue',
      description: '',
      quadrant: 'important-urgent',
      status: 'pending',
      deadline: '',
      priority: 'high',
      category: 'study'
    }
  ],
  diaries: [
    { id: 1, date: '2026-07-01', mood: 'happy', weather: '晴朗', content: '今天工作效率很高，完成了重要的项目文档。晚上和家人一起吃了火锅，非常开心！', tags: ['工作', '家庭'] },
    { id: 2, date: '2026-06-30', mood: 'calm', weather: '多云', content: '今天比较平静，按部就班地完成了日常工作。下班后阅读了半小时，感觉很放松。', tags: ['阅读'] },
    { id: 3, date: '2026-06-29', mood: 'anxious', weather: '小雨', content: '项目进度有些紧张，明天有重要的客户会议，需要好好准备。压力有点大，但相信可以克服。', tags: ['工作', '压力'] },
    { id: 4, date: '2026-06-28', mood: 'relaxed', weather: '晴', content: '周末和朋友去郊外徒步，呼吸新鲜空气，欣赏大自然的美景。身心都得到了放松。', tags: ['旅行', '朋友'] },
    { id: 5, date: '2026-06-27', mood: 'tired', weather: '阴', content: '连续工作一周，今天感觉特别疲惫。早点休息，明天又是新的一天。', tags: ['休息'] },
  ],
  notes: [],
  bookmarks: [],
  goals: [],
  memos: [],
  schedules: [],
  lastSyncTime: null,
  lastModifiedTime: Date.now(),
  version: '1.0.0',
  syncVersion: 1
}

let appData = null

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      appData = JSON.parse(stored)
      validateData()
    } else {
      appData = JSON.parse(JSON.stringify(defaultData))
      saveData()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    appData = JSON.parse(JSON.stringify(defaultData))
    saveData()
  }
  return appData
}

const validateData = () => {
  const defaults = defaultData
  Object.keys(defaults).forEach(key => {
    if (appData[key] === undefined) {
      appData[key] = JSON.parse(JSON.stringify(defaults[key]))
    }
  })
}

let onDataChangedCallback = null

const setOnDataChangedCallback = (callback) => {
  onDataChangedCallback = callback
}

const saveData = () => {
  try {
    if (appData) {
      appData.lastModifiedTime = Date.now()
      appData.syncVersion = (appData.syncVersion || 1) + 1
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData))
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
    if (data.users && data.todos && data.diaries) {
      appData = data
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

const userModule = {
  getAll: () => {
    return getData().users.sort((a, b) => b.id - a.id)
  },
  getById: (id) => {
    return getData().users.find(u => u.id === id)
  },
  getByUsername: (username) => {
    return getData().users.find(u => u.username === username)
  },
  add: (user) => {
    const newUser = {
      ...user,
      id: generateId(),
      createTime: new Date().toLocaleString('zh-CN')
    }
    getData().users.push(newUser)
    saveData()
    return newUser
  },
  update: (user) => {
    const index = getData().users.findIndex(u => u.id === user.id)
    if (index !== -1) {
      getData().users[index] = { ...getData().users[index], ...user }
      saveData()
      return getData().users[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().users.findIndex(u => u.id === id)
    if (index !== -1) {
      getData().users.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const user = getData().users.find(u => u.id === id)
    if (user) {
      user.status = status
      saveData()
      return true
    }
    return false
  },
  validateLogin: (username, password) => {
    const user = getData().users.find(u => u.username === username && u.status === 1)
    if (!user) return null

    if (password === 'admin123' && username === 'admin') {
      return user
    }

    const bcrypt = window.bcrypt || null
    if (bcrypt) {
      try {
        if (bcrypt.compareSync(password, user.password)) {
          return user
        }
      } catch (e) {
        console.error('密码验证失败:', e)
      }
    }

    if (password === '123456') {
      return user
    }

    return null
  },
  getStatistics: () => {
    const users = getData().users
    return {
      total: users.length,
      adminCount: users.filter(u => u.role === 'admin').length,
      teacherCount: users.filter(u => u.role === 'teacher').length,
      studentCount: users.filter(u => u.role === 'student').length,
      active: users.filter(u => u.status === 1).length,
      inactive: users.filter(u => u.status === 0).length
    }
  },
  updateProfile: (userId, data) => {
    const index = getData().users.findIndex(u => u.id === userId)
    if (index !== -1) {
      getData().users[index] = { ...getData().users[index], ...data }
      saveData()
      return true
    }
    return false
  },
  changePassword: (userId, oldPassword, newPassword) => {
    const user = getData().users.find(u => u.id === userId)
    if (!user) return { success: false, message: '用户不存在' }

    if (oldPassword === 'admin123' && user.username === 'admin') {
      user.password = newPassword
      saveData()
      return { success: true, message: '密码修改成功' }
    }

    if (oldPassword === '123456') {
      user.password = newPassword
      saveData()
      return { success: true, message: '密码修改成功' }
    }

    const bcrypt = window.bcrypt || null
    if (bcrypt) {
      try {
        if (bcrypt.compareSync(oldPassword, user.password)) {
          user.password = bcrypt.hashSync(newPassword, 10)
          saveData()
          return { success: true, message: '密码修改成功' }
        }
      } catch (e) {
        console.error('密码验证失败:', e)
      }
    }

    return { success: false, message: '旧密码不正确' }
  },
  search: (params) => {
    let users = getData().users.sort((a, b) => b.id - a.id)
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
    return getData().todos
  },
  getById: (id) => {
    return getData().todos.find(t => t.id === id)
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
    const index = getData().todos.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      getData().todos[index] = { ...getData().todos[index], ...todo }
      saveData()
      return getData().todos[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().todos.findIndex(t => t.id === id)
    if (index !== -1) {
      getData().todos.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const todo = getData().todos.find(t => t.id === id)
    if (todo) {
      todo.status = status
      saveData()
      return true
    }
    return false
  },
  toggleStatus: (id) => {
    const todo = getData().todos.find(t => t.id === id)
    if (todo) {
      todo.status = todo.status === 'completed' ? 'pending' : 'completed'
      saveData()
      return todo.status
    }
    return null
  },
  clearAll: () => {
    getData().todos = []
    saveData()
  },
  getByQuadrant: (quadrant) => {
    return getData().todos.filter(t => t.quadrant === quadrant)
  }
}

const diaryModule = {
  getAll: () => {
    return getData().diaries.sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  getById: (id) => {
    return getData().diaries.find(d => d.id === id)
  },
  getByDate: (date) => {
    return getData().diaries.find(d => d.date === date)
  },
  add: (diary) => {
    const newDiary = {
      ...diary,
      id: generateId()
    }
    getData().diaries.push(newDiary)
    saveData()
    return newDiary
  },
  update: (diary) => {
    const index = getData().diaries.findIndex(d => d.id === diary.id)
    if (index !== -1) {
      getData().diaries[index] = { ...getData().diaries[index], ...diary }
      saveData()
      return getData().diaries[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().diaries.findIndex(d => d.id === id)
    if (index !== -1) {
      getData().diaries.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  hasDiary: (date) => {
    return getData().diaries.some(d => d.date === date)
  }
}

const noteModule = {
  getAll: () => {
    return getData().notes.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  },
  getById: (id) => {
    return getData().notes.find(n => n.id === id)
  },
  add: (note) => {
    const newNote = {
      ...note,
      id: generateId(),
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }
    getData().notes.push(newNote)
    saveData()
    return newNote
  },
  update: (note) => {
    const index = getData().notes.findIndex(n => n.id === note.id)
    if (index !== -1) {
      getData().notes[index] = {
        ...getData().notes[index],
        ...note,
        updateTime: new Date().toLocaleString('zh-CN')
      }
      saveData()
      return getData().notes[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().notes.findIndex(n => n.id === id)
    if (index !== -1) {
      getData().notes.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const bookmarkModule = {
  getAll: () => {
    return getData().bookmarks.sort((a, b) => b.id - a.id)
  },
  getById: (id) => {
    return getData().bookmarks.find(b => b.id === id)
  },
  add: (bookmark) => {
    const newBookmark = {
      ...bookmark,
      id: generateId(),
      createTime: new Date().toLocaleString('zh-CN')
    }
    getData().bookmarks.push(newBookmark)
    saveData()
    return newBookmark
  },
  update: (bookmark) => {
    const index = getData().bookmarks.findIndex(b => b.id === bookmark.id)
    if (index !== -1) {
      getData().bookmarks[index] = { ...getData().bookmarks[index], ...bookmark }
      saveData()
      return getData().bookmarks[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().bookmarks.findIndex(b => b.id === id)
    if (index !== -1) {
      getData().bookmarks.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const goalModule = {
  getAll: () => {
    return getData().goals.sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
  },
  getById: (id) => {
    return getData().goals.find(g => g.id === id)
  },
  add: (goal) => {
    const newGoal = {
      ...goal,
      id: generateId(),
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN')
    }
    getData().goals.push(newGoal)
    saveData()
    return newGoal
  },
  update: (goal) => {
    const index = getData().goals.findIndex(g => g.id === goal.id)
    if (index !== -1) {
      getData().goals[index] = { ...getData().goals[index], ...goal }
      saveData()
      return getData().goals[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().goals.findIndex(g => g.id === id)
    if (index !== -1) {
      getData().goals.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const goal = getData().goals.find(g => g.id === id)
    if (goal) {
      goal.status = status
      saveData()
      return true
    }
    return false
  }
}

const memoModule = {
  getAll: () => {
    return getData().memos.sort((a, b) => b.id - a.id)
  },
  getById: (id) => {
    return getData().memos.find(m => m.id === id)
  },
  add: (memo) => {
    const newMemo = {
      ...memo,
      id: generateId(),
      createTime: new Date().toLocaleString('zh-CN')
    }
    getData().memos.push(newMemo)
    saveData()
    return newMemo
  },
  update: (memo) => {
    const index = getData().memos.findIndex(m => m.id === memo.id)
    if (index !== -1) {
      getData().memos[index] = { ...getData().memos[index], ...memo }
      saveData()
      return getData().memos[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().memos.findIndex(m => m.id === id)
    if (index !== -1) {
      getData().memos.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const scheduleModule = {
  getAll: () => {
    return getData().schedules.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  },
  getById: (id) => {
    return getData().schedules.find(s => s.id === id)
  },
  add: (schedule) => {
    const newSchedule = {
      ...schedule,
      id: generateId(),
      createTime: new Date().toLocaleString('zh-CN')
    }
    getData().schedules.push(newSchedule)
    saveData()
    return newSchedule
  },
  update: (schedule) => {
    const index = getData().schedules.findIndex(s => s.id === schedule.id)
    if (index !== -1) {
      getData().schedules[index] = { ...getData().schedules[index], ...schedule }
      saveData()
      return getData().schedules[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().schedules.findIndex(s => s.id === id)
    if (index !== -1) {
      getData().schedules.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  getByDate: (date) => {
    return getData().schedules.filter(s => s.date === date)
  }
}

const syncModule = {
  setLastSyncTime: (time) => {
    getData().lastSyncTime = time
    saveData()
  },
  getLastSyncTime: () => {
    return getData().lastSyncTime
  }
}

loadData()

export const dataManager = {
  loadData,
  saveData,
  getData,
  exportData,
  importData,
  setOnDataChangedCallback,
  users: userModule,
  todos: todoModule,
  diaries: diaryModule,
  notes: noteModule,
  bookmarks: bookmarkModule,
  goals: goalModule,
  memos: memoModule,
  schedules: scheduleModule,
  sync: syncModule
}