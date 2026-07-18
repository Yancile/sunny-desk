import { reactive } from 'vue'

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
      id: '1',
      title: '网页设计',
      description: '',
      quadrant: 'important-not-urgent',
      status: 'completed',
      deadline: '',
      priority: 'medium',
      category: 'work'
    },
    {
      id: '2',
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
  notes: [
    { id: 1, title: '第一章概述', notebookId: 1, sectionId: 1, parentId: null, content: '# 第一章概述\n\n## 数据结构的基本概念\n\n数据结构是计算机存储、组织数据的方式。\n\n### 基本术语\n\n- 数据\n- 数据元素\n- 数据项', tags: [], createdAt: '2026-04-22T22:46', updatedAt: '2026-04-22T22:46' },
    { id: 2, title: '数据的定义', notebookId: 1, sectionId: 1, parentId: 1, content: '# 数据的定义\n\n数据是描述客观事物的符号，是计算机中可以操作的对象。', tags: [], createdAt: '2026-04-22T22:50', updatedAt: '2026-04-22T22:50' },
    { id: 3, title: '数据元素', notebookId: 1, sectionId: 1, parentId: 1, content: '# 数据元素\n\n数据元素是数据的基本单位，在计算机程序中通常作为一个整体进行考虑和处理。', tags: [], createdAt: '2026-04-22T22:52', updatedAt: '2026-04-22T22:52' },
    { id: 4, title: '第二章线性表', notebookId: 1, sectionId: 2, parentId: null, content: '# 第二章线性表\n\n## 线性表的定义\n\n线性表是具有相同特性的数据元素的一个有限序列。', tags: [], createdAt: '2026-04-25T14:30', updatedAt: '2026-04-25T14:30' },
    { id: 5, title: '线性表的顺序存储', notebookId: 1, sectionId: 2, parentId: 4, content: '# 线性表的顺序存储\n\n用一组地址连续的存储单元依次存储线性表的数据元素。', tags: [], createdAt: '2026-04-25T14:40', updatedAt: '2026-04-25T14:40' },
    { id: 6, title: '第三章栈和队列', notebookId: 1, sectionId: 3, parentId: null, content: '# 第三章栈和队列\n\n## 栈\n\n栈是一种特殊的线性表，只能在一端进行插入和删除操作。', tags: [], createdAt: '2026-04-28T10:15', updatedAt: '2026-04-28T10:15' },
    { id: 7, title: '计算机系统概述', notebookId: 2, sectionId: 8, parentId: null, content: '# 第一章 计算机系统概述\n\n## 冯·诺依曼结构\n\n冯·诺依曼计算机由五大部件组成。', tags: [], createdAt: '2026-05-01T09:00', updatedAt: '2026-05-01T09:00' },
    { id: 8, title: '数据的表示和运算', notebookId: 2, sectionId: 9, parentId: null, content: '# 第二章 数据的表示和运算\n\n## 数制转换\n\n二进制、八进制、十进制、十六进制之间的转换方法。', tags: [], createdAt: '2026-05-05T16:20', updatedAt: '2026-05-05T16:20' },
  ],
  notebooks: [
    { id: 1, name: '数据结构', icon: '📘', color: '#3b82f6' },
    { id: 2, name: '组成原理', icon: '📗', color: '#10b981' },
    { id: 3, name: '408', icon: '📕', color: '#ef4444' },
    { id: 4, name: '英语', icon: '📙', color: '#f59e0b' },
  ],
  sections: [
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
  ],
  bookmarks: [],
  categories: [
    { id: 1, name: '开发工具', icon: 'layui-icon layui-icon-code' },
    { id: 2, name: '学习资源', icon: 'layui-icon layui-icon-education' },
    { id: 3, name: '新闻资讯', icon: 'layui-icon layui-icon-news' },
    { id: 4, name: '社交娱乐', icon: 'layui-icon layui-icon-face-smile' },
    { id: 5, name: '常用工具', icon: 'layui-icon layui-icon-tool' },
  ],
  goals: [
    {
      id: 1,
      title: '完成年度学习计划',
      description: '掌握Vue3、TypeScript等前端技术，提升专业能力',
      category: 'study',
      deadline: '2026-12-31',
      progress: 45,
      milestones: [
        { title: 'Vue3基础学习', date: '2026-03-31', completed: true },
        { title: 'TypeScript进阶', date: '2026-06-30', completed: true },
        { title: '项目实战', date: '2026-09-30', completed: false },
        { title: '技术总结', date: '2026-12-31', completed: false }
      ]
    },
    {
      id: 2,
      title: '健身目标 - 减脂塑形',
      description: '通过规律运动和健康饮食，达到理想体型',
      category: 'fitness',
      deadline: '2026-09-30',
      progress: 30,
      milestones: [
        { title: '减重5kg', date: '2026-05-31', completed: true },
        { title: '减重10kg', date: '2026-07-31', completed: false },
        { title: '体脂率达标', date: '2026-09-30', completed: false }
      ]
    },
    {
      id: 3,
      title: '阅读20本书',
      description: '涵盖技术、管理、文学等多个领域',
      category: 'life',
      deadline: '2026-12-31',
      progress: 25,
      milestones: [
        { title: '完成5本', date: '2026-03-31', completed: true },
        { title: '完成10本', date: '2026-06-30', completed: false },
        { title: '完成15本', date: '2026-09-30', completed: false },
        { title: '完成20本', date: '2026-12-31', completed: false }
      ]
    },
    {
      id: 4,
      title: '财务目标 - 存款计划',
      description: '制定合理的储蓄计划，实现财务自由',
      category: 'finance',
      deadline: '2026-12-31',
      progress: 60,
      milestones: [
        { title: '存满1万元', date: '2026-03-31', completed: true },
        { title: '存满3万元', date: '2026-06-30', completed: true },
        { title: '存满5万元', date: '2026-09-30', completed: false },
        { title: '存满8万元', date: '2026-12-31', completed: false }
      ]
    },
    {
      id: 5,
      title: '项目管理能力提升',
      description: '学习项目管理方法论，提升团队协作效率',
      category: 'work',
      deadline: '2026-08-31',
      progress: 75,
      milestones: [
        { title: 'PMP认证学习', date: '2026-04-30', completed: true },
        { title: '项目实战应用', date: '2026-06-30', completed: true },
        { title: '团队培训', date: '2026-08-31', completed: false }
      ]
    }
  ],
  memos: [
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
  ],
  schedules: [
    { id: 1, title: '产品需求评审', date: '2026-07-01', time: '09:30', location: '会议室A', description: '讨论Q3产品需求', color: '#1e4d7b', repeat: 'none', completed: false },
    { id: 2, title: '客户电话会议', date: '2026-07-01', time: '14:00', location: '线上', description: '与客户沟通项目进展', color: '#0d9488', repeat: 'none', completed: false },
    { id: 3, title: '团队周会', date: '2026-07-02', time: '10:00', location: '会议室B', color: '#8b5cf6', repeat: 'weekly', completed: false },
    { id: 4, title: '代码审查', date: '2026-07-03', time: '15:00', location: '线上', description: '审查团队成员提交的代码', color: '#f59e0b', repeat: 'none', completed: false },
    { id: 5, title: '健身', date: '2026-07-04', time: '18:00', location: '健身房', color: '#ef4444', repeat: 'daily', completed: false },
    { id: 6, title: '学习Vue3', date: '2026-07-05', time: '20:00', location: '家里', description: '学习组合式API', color: '#10b981', repeat: 'none', completed: false },
  ],
  habits: [
    {
      id: '1',
      name: '早起',
      icon: 'layui-icon layui-icon-sunny',
      color: '#f59e0b',
      streak: 15,
      todayChecked: true,
      checkedDays: ['2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01']
    },
    {
      id: '2',
      name: '阅读',
      icon: 'layui-icon layui-icon-book',
      color: '#8b5cf6',
      streak: 8,
      todayChecked: false,
      checkedDays: ['2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30']
    },
    {
      id: '3',
      name: '运动',
      icon: 'layui-icon layui-icon-heart',
      color: '#ef4444',
      streak: 5,
      todayChecked: false,
      checkedDays: ['2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01']
    },
    {
      id: '4',
      name: '冥想',
      icon: 'layui-icon layui-icon-face-smile',
      color: '#10b981',
      streak: 21,
      todayChecked: true,
      checkedDays: ['2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17']
    },
    {
      id: '5',
      name: '写日记',
      icon: 'layui-icon layui-icon-file',
      color: '#3b82f6',
      streak: 3,
      todayChecked: false,
      checkedDays: ['2026-06-29', '2026-06-30', '2026-07-01']
    },
    {
      id: '6',
      name: '代码练习',
      icon: 'layui-icon layui-icon-code',
      color: '#ec4899',
      streak: 10,
      todayChecked: true,
      checkedDays: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28']
    }
  ],
  lastSyncTime: null,
  lastModifiedTime: Date.now(),
  version: '1.0.0',
  syncVersion: 1,
  errorbook: [],
  subjectBooks: [
    { id: 1, name: '数学', icon: '📐', color: '#3b82f6', count: 0 },
    { id: 2, name: '英语', icon: '📚', color: '#e69cf2ff', count: 0 },
    { id: 3, name: '数据结构', icon: '⚛️', color: '#f59e0b', count: 0 },
    { id: 4, name: '组成原理', icon: '🧪', color: '#2695dfff', count: 0 },
    { id: 5, name: '操作系统', icon: '📖', color: '#10b981', count: 0 },
    { id: 6, name: '计算机网络', icon: '🌐', color: '#ec4899', count: 0 }
  ],
  errorbookTags: [],
  errorbookConfig: {
    sourceTypes: ['书本', '试卷', '作业', '课堂笔记', '练习册', '其他'],
    stickingTypes: ['概念不清', '方法不当', '计算错误', '审题偏差', '其他']
  }
}

let appData = null

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      appData = reactive(JSON.parse(stored))
      validateData()
    } else {
      appData = reactive(JSON.parse(JSON.stringify(defaultData)))
      saveData()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    appData = reactive(JSON.parse(JSON.stringify(defaultData)))
    saveData()
  }
  return appData
}

const validateData = () => {
  const defaults = defaultData
  let needsSave = false
  Object.keys(defaults).forEach(key => {
    if (appData[key] === undefined || appData[key] === null || (Array.isArray(appData[key]) && appData[key].length === 0)) {
      appData[key] = JSON.parse(JSON.stringify(defaults[key]))
      needsSave = true
    }
  })
  const modules = ['users', 'todos', 'diaries', 'notes', 'goals', 'memos', 'notebooks', 'sections', 'habits', 'schedules', 'bookmarks', 'categories']
  modules.forEach(moduleName => {
    if (appData[moduleName]) {
      appData[moduleName].forEach(item => {
        if (typeof item.id !== 'string') {
          item.id = String(item.id)
          needsSave = true
        }
        if (item.notebookId && typeof item.notebookId !== 'string') {
          item.notebookId = String(item.notebookId)
          needsSave = true
        }
        if (item.sectionId && typeof item.sectionId !== 'string') {
          item.sectionId = String(item.sectionId)
          needsSave = true
        }
      })
    }
  })
  if (appData.todos) {
    appData.todos.forEach(todo => {
      if (!todo.quadrant) {
        todo.quadrant = 'important-not-urgent'
        needsSave = true
      }
      if (!todo.status) {
        todo.status = 'pending'
        needsSave = true
      }
    })
  }
  if (appData.errorbook) {
    appData.errorbook.forEach(error => {
      if (!error.tags) {
        error.tags = []
        needsSave = true
      }
      if (!error.sourceImages) {
        error.sourceImages = []
        needsSave = true
      }
      if (!error.stickingImages) {
        error.stickingImages = []
        needsSave = true
      }
      if (!error.similarQuestions) {
        error.similarQuestions = []
        needsSave = true
      }
      if (!error.status) {
        error.status = 'pending'
        needsSave = true
      }
      if (!error.reviewCount) {
        error.reviewCount = 0
        needsSave = true
      }
    })
  }
  if (needsSave) {
    saveData()
  }
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
    return getData().users.slice().reverse()
  },
  getById: (id) => {
    return getData().users.find(u => String(u.id) === String(id))
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
    const index = getData().users.findIndex(u => String(u.id) === String(user.id))
    if (index !== -1) {
      getData().users[index] = { ...getData().users[index], ...user }
      saveData()
      return getData().users[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().users.findIndex(u => String(u.id) === String(id))
    if (index !== -1) {
      getData().users.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const user = getData().users.find(u => String(u.id) === String(id))
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
    let users = getData().users.slice().reverse()
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
      saveData()
      return getData().todos[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().todos.findIndex(t => String(t.id) === String(id))
    if (index !== -1) {
      getData().todos.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const todo = getData().todos.find(t => String(t.id) === String(id))
    if (todo) {
      todo.status = status
      saveData()
      return true
    }
    return false
  },
  toggleStatus: (id) => {
    const todo = getData().todos.find(t => String(t.id) === String(id))
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
      id: generateId()
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
    const index = getData().diaries.findIndex(d => String(d.id) === String(id))
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
    return [...getData().notes].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  },
  getById: (id) => {
    return getData().notes.find(n => String(n.id) === String(id))
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
    const index = getData().notes.findIndex(n => String(n.id) === String(note.id))
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
    const index = getData().notes.findIndex(n => String(n.id) === String(id))
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
    return getData().bookmarks.slice().reverse()
  },
  getById: (id) => {
    return getData().bookmarks.find(b => String(b.id) === String(id))
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
    const index = getData().bookmarks.findIndex(b => String(b.id) === String(bookmark.id))
    if (index !== -1) {
      getData().bookmarks[index] = { ...getData().bookmarks[index], ...bookmark }
      saveData()
      return getData().bookmarks[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().bookmarks.findIndex(b => String(b.id) === String(id))
    if (index !== -1) {
      getData().bookmarks.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  saveAll: (bookmarks) => {
    getData().bookmarks = bookmarks
    saveData()
  }
}

const categoryModule = {
  getAll: () => {
    return getData().categories.slice().reverse()
  },
  getById: (id) => {
    return getData().categories.find(c => String(c.id) === String(id))
  },
  add: (category) => {
    const newCategory = {
      ...category,
      id: generateId(),
      icon: category.icon || 'layui-icon layui-icon-link'
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
    const index = getData().categories.findIndex(c => String(c.id) === String(id))
    if (index !== -1) {
      getData().categories.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  saveAll: (categories) => {
    getData().categories = categories
    saveData()
  }
}

const goalModule = {
  getAll: () => {
    return [...getData().goals].sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
  },
  getById: (id) => {
    return getData().goals.find(g => String(g.id) === String(id))
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
    const index = getData().goals.findIndex(g => String(g.id) === String(goal.id))
    if (index !== -1) {
      getData().goals[index] = { ...getData().goals[index], ...goal }
      saveData()
      return getData().goals[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().goals.findIndex(g => String(g.id) === String(id))
    if (index !== -1) {
      getData().goals.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const goal = getData().goals.find(g => String(g.id) === String(id))
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
    return getData().memos.slice().reverse()
  },
  getById: (id) => {
    return getData().memos.find(m => String(m.id) === String(id))
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
    const index = getData().memos.findIndex(m => String(m.id) === String(memo.id))
    if (index !== -1) {
      getData().memos[index] = { ...getData().memos[index], ...memo }
      saveData()
      return getData().memos[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().memos.findIndex(m => String(m.id) === String(id))
    if (index !== -1) {
      getData().memos.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const notebookModule = {
  getAll: () => {
    return getData().notebooks.slice().reverse()
  },
  getById: (id) => {
    return getData().notebooks.find(n => String(n.id) === String(id))
  },
  add: (notebook) => {
    const newNotebook = {
      ...notebook,
      id: generateId()
    }
    getData().notebooks.push(newNotebook)
    saveData()
    return newNotebook
  },
  update: (notebook) => {
    const index = getData().notebooks.findIndex(n => String(n.id) === String(notebook.id))
    if (index !== -1) {
      getData().notebooks[index] = { ...getData().notebooks[index], ...notebook }
      saveData()
      return getData().notebooks[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().notebooks.findIndex(n => String(n.id) === String(id))
    if (index !== -1) {
      getData().notebooks.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const sectionModule = {
  getAll: () => {
    return getData().sections.slice().reverse()
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
      id: generateId()
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
    const index = getData().sections.findIndex(s => String(s.id) === String(id))
    if (index !== -1) {
      getData().sections.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const habitModule = {
  getAll: () => {
    return getData().habits.slice().reverse()
  },
  getById: (id) => {
    return getData().habits.find(h => String(h.id) === String(id))
  },
  add: (habit) => {
    const newHabit = {
      ...habit,
      id: generateId(),
      streak: 0,
      todayChecked: false,
      checkedDays: []
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
    const index = getData().habits.findIndex(h => String(h.id) === String(id))
    if (index !== -1) {
      getData().habits.splice(index, 1)
      saveData()
      return true
    }
    return false
  }
}

const scheduleModule = {
  getAll: () => {
    return [...getData().schedules].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`)
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`)
      return dateA - dateB
    })
  },
  getById: (id) => {
    return getData().schedules.find(s => String(s.id) === String(id))
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
    const index = getData().schedules.findIndex(s => String(s.id) === String(schedule.id))
    if (index !== -1) {
      getData().schedules[index] = { ...getData().schedules[index], ...schedule }
      saveData()
      return getData().schedules[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().schedules.findIndex(s => String(s.id) === String(id))
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

const errorbookModule = {
  getAll: () => {
    return [...getData().errorbook].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  getById: (id) => {
    return getData().errorbook.find(e => String(e.id) === String(id))
  },
  getBySubject: (subject) => {
    return getData().errorbook.filter(e => e.subject === subject).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  add: (errorbook) => {
    const newErrorbook = {
      ...errorbook,
      id: generateId(),
      status: errorbook.status || 'pending',
      reviewCount: 0,
      lastReviewDate: null,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      tags: errorbook.tags || [],
      images: errorbook.images || []
    }
    getData().errorbook.push(newErrorbook)
    subjectBookModule.updateCount(newErrorbook.subject)
    saveData()
    return newErrorbook
  },
  update: (errorbook) => {
    const index = getData().errorbook.findIndex(e => String(e.id) === String(errorbook.id))
    if (index !== -1) {
      const oldSubject = getData().errorbook[index].subject
      getData().errorbook[index] = { ...getData().errorbook[index], ...errorbook }
      if (oldSubject !== errorbook.subject) {
        subjectBookModule.updateCount(oldSubject)
        subjectBookModule.updateCount(errorbook.subject)
      }
      saveData()
      return getData().errorbook[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().errorbook.findIndex(e => String(e.id) === String(id))
    if (index !== -1) {
      const subject = getData().errorbook[index].subject
      getData().errorbook.splice(index, 1)
      subjectBookModule.updateCount(subject)
      saveData()
      return true
    }
    return false
  },
  updateStatus: (id, status) => {
    const errorbook = getData().errorbook.find(e => String(e.id) === String(id))
    if (errorbook) {
      errorbook.status = status
      errorbook.reviewCount = (errorbook.reviewCount || 0) + 1
      errorbook.lastReviewDate = new Date().toLocaleDateString('zh-CN')
      saveData()
      return true
    }
    return false
  },
  addTag: (id, tag) => {
    const errorbook = getData().errorbook.find(e => String(e.id) === String(id))
    if (errorbook) {
      if (!errorbook.tags) errorbook.tags = []
      if (!errorbook.tags.includes(tag)) {
        errorbook.tags.push(tag)
        saveData()
      }
      return true
    }
    return false
  },
  removeTag: (id, tag) => {
    const errorbook = getData().errorbook.find(e => String(e.id) === String(id))
    if (errorbook && errorbook.tags) {
      const tagIndex = errorbook.tags.indexOf(tag)
      if (tagIndex !== -1) {
        errorbook.tags.splice(tagIndex, 1)
        saveData()
        return true
      }
    }
    return false
  },
  getStats: () => {
    const items = getData().errorbook
    const total = items.length
    const pending = items.filter(e => e.status === 'pending').length
    const mastered = items.filter(e => e.status === 'mastered').length
    const retry = items.filter(e => e.status === 'retry').length

    const subjectStats = {}
    items.forEach(e => {
      if (!subjectStats[e.subject]) {
        subjectStats[e.subject] = 0
      }
      subjectStats[e.subject]++
    })

    const stickingTypeStats = {}
    items.forEach(e => {
      if (!stickingTypeStats[e.stickingType]) {
        stickingTypeStats[e.stickingType] = 0
      }
      stickingTypeStats[e.stickingType]++
    })

    return {
      total,
      pending,
      mastered,
      retry,
      subjectStats,
      stickingTypeStats
    }
  },
  getSubjects: () => {
    const items = getData().errorbook
    const subjects = [...new Set(items.map(e => e.subject))]
    return subjects
  },
  getStickingTypes: () => {
    const items = getData().errorbook
    const types = [...new Set(items.map(e => e.stickingType))]
    return types
  },
  getSourceNames: () => {
    const items = getData().errorbook
    const names = [...new Set(items.map(e => e.sourceName))]
    return names
  },
  getAllTags: () => {
    const items = getData().errorbook
    const allTags = []
    items.forEach(e => {
      if (e.tags) {
        e.tags.forEach(tag => {
          if (!allTags.includes(tag)) {
            allTags.push(tag)
          }
        })
      }
    })
    return allTags
  },
  getAllSourceTypes: () => {
    const items = getData().errorbook
    const allTypes = []
    items.forEach(e => {
      if (e.sourceType) {
        const types = Array.isArray(e.sourceType) ? e.sourceType : [e.sourceType]
        types.forEach(type => {
          if (!allTypes.includes(type)) {
            allTypes.push(type)
          }
        })
      }
    })
    return allTypes
  },
  filter: (params) => {
    let items = getData().errorbook.slice()
    if (params.subject) {
      items = items.filter(e => e.subject === params.subject)
    }
    if (params.status) {
      items = items.filter(e => e.status === params.status)
    }
    if (params.stickingType) {
      items = items.filter(e => e.stickingType === params.stickingType)
    }
    if (params.sourceType) {
      items = items.filter(e => {
        const types = Array.isArray(e.sourceType) ? e.sourceType : [e.sourceType]
        return types.includes(params.sourceType)
      })
    }
    if (params.searchSource) {
      const search = params.searchSource.toLowerCase()
      items = items.filter(e => {
        if (e.chapter && e.chapter.toLowerCase().includes(search)) return true
        if (e.problemId && e.problemId.toLowerCase().includes(search)) return true
        const types = Array.isArray(e.sourceType) ? e.sourceType : [e.sourceType]
        return types.some(type => type.toLowerCase().includes(search))
      })
    }
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

const subjectBookModule = {
  getAll: () => {
    return [...getData().subjectBooks]
  },
  getById: (id) => {
    return getData().subjectBooks.find(s => String(s.id) === String(id))
  },
  getByName: (name) => {
    return getData().subjectBooks.find(s => s.name === name)
  },
  add: (subject) => {
    const newSubject = {
      ...subject,
      id: generateId(),
      count: 0
    }
    getData().subjectBooks.push(newSubject)
    saveData()
    return newSubject
  },
  update: (subject) => {
    const index = getData().subjectBooks.findIndex(s => String(s.id) === String(subject.id))
    if (index !== -1) {
      getData().subjectBooks[index] = { ...getData().subjectBooks[index], ...subject }
      saveData()
      return getData().subjectBooks[index]
    }
    return null
  },
  delete: (id) => {
    const index = getData().subjectBooks.findIndex(s => String(s.id) === String(id))
    if (index !== -1) {
      getData().subjectBooks.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateCount: (subjectName) => {
    const subject = getData().subjectBooks.find(s => s.name === subjectName)
    if (subject) {
      const count = getData().errorbook.filter(e => e.subject === subjectName).length
      subject.count = count
      saveData()
    }
  },
  refreshAllCounts: () => {
    getData().subjectBooks.forEach(s => {
      s.count = getData().errorbook.filter(e => e.subject === s.name).length
    })
    saveData()
  }
}

const errorbookTagModule = {
  getAll: () => {
    return [...getData().errorbookTags]
  },
  add: (tag) => {
    const newTag = {
      ...tag,
      id: generateId(),
      createdAt: new Date().toLocaleDateString('zh-CN')
    }
    getData().errorbookTags.push(newTag)
    saveData()
    return newTag
  },
  delete: (id) => {
    const index = getData().errorbookTags.findIndex(t => String(t.id) === String(id))
    if (index !== -1) {
      getData().errorbookTags.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  update: (tag) => {
    const index = getData().errorbookTags.findIndex(t => String(t.id) === String(tag.id))
    if (index !== -1) {
      getData().errorbookTags[index] = { ...getData().errorbookTags[index], ...tag }
      saveData()
      return getData().errorbookTags[index]
    }
    return null
  }
}

const errorbookConfigModule = {
  getConfig: () => {
    return getData().errorbookConfig
  },
  getSourceTypes: () => {
    return [...getData().errorbookConfig.sourceTypes]
  },
  addSourceType: (type) => {
    const types = getData().errorbookConfig.sourceTypes
    if (!types.includes(type)) {
      types.push(type)
      saveData()
      return true
    }
    return false
  },
  removeSourceType: (type) => {
    const types = getData().errorbookConfig.sourceTypes
    const index = types.indexOf(type)
    if (index !== -1) {
      types.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateSourceType: (oldType, newType) => {
    const types = getData().errorbookConfig.sourceTypes
    const index = types.indexOf(oldType)
    if (index !== -1 && !types.includes(newType)) {
      types[index] = newType
      getData().errorbook.forEach(e => {
        if (e.sourceType) {
          if (Array.isArray(e.sourceType)) {
            e.sourceType = e.sourceType.map(t => t === oldType ? newType : t)
          } else if (e.sourceType === oldType) {
            e.sourceType = newType
          }
        }
      })
      saveData()
      return true
    }
    return false
  },
  getStickingTypes: () => {
    return [...getData().errorbookConfig.stickingTypes]
  },
  addStickingType: (type) => {
    const types = getData().errorbookConfig.stickingTypes
    if (!types.includes(type)) {
      types.push(type)
      saveData()
      return true
    }
    return false
  },
  removeStickingType: (type) => {
    const types = getData().errorbookConfig.stickingTypes
    const index = types.indexOf(type)
    if (index !== -1) {
      types.splice(index, 1)
      saveData()
      return true
    }
    return false
  },
  updateStickingType: (oldType, newType) => {
    const types = getData().errorbookConfig.stickingTypes
    const index = types.indexOf(oldType)
    if (index !== -1 && !types.includes(newType)) {
      types[index] = newType
      getData().errorbook.forEach(e => {
        if (e.stickingType === oldType) {
          e.stickingType = newType
        }
      })
      saveData()
      return true
    }
    return false
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
  errorbookConfig: errorbookConfigModule
}