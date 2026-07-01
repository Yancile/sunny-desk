import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', breadcrumb: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '工作台', requiresAuth: true, breadcrumb: '工作台' },
      },
      {
        path: 'todo',
        name: 'todo',
        component: () => import('@/views/TodoView.vue'),
        meta: { title: '待办事项', requiresAuth: true, breadcrumb: '待办事项' },
      },
      {
        path: 'goals',
        name: 'goals',
        component: () => import('@/views/GoalsView.vue'),
        meta: { title: '长期目标', requiresAuth: true, breadcrumb: '长期目标' },
      },
      {
        path: 'memo',
        name: 'memo',
        component: () => import('@/views/MemoView.vue'),
        meta: { title: '备忘录', requiresAuth: true, breadcrumb: '备忘录' },
      },
      {
        path: 'schedule',
        name: 'schedule',
        component: () => import('@/views/ScheduleView.vue'),
        meta: { title: '日程管理', requiresAuth: true, breadcrumb: '日程管理' },
      },
      {
        path: 'diary',
        name: 'diary',
        component: () => import('@/views/DiaryView.vue'),
        meta: { title: '日记', requiresAuth: true, breadcrumb: '日记' },
      },
      {
        path: 'notes',
        name: 'notes',
        component: () => import('@/views/NotesView.vue'),
        meta: { title: '笔记本', requiresAuth: true, breadcrumb: '笔记本' },
      },
      {
        path: 'bookmarks',
        name: 'bookmarks',
        component: () => import('@/views/BookmarksView.vue'),
        meta: { title: '网站导航', requiresAuth: true, breadcrumb: '网站导航' },
      },
      {
        path: 'pomodoro',
        name: 'pomodoro',
        component: () => import('@/views/PomodoroView.vue'),
        meta: { title: '番茄钟', requiresAuth: true, breadcrumb: '番茄钟' },
      },
      {
        path: 'user-management',
        name: 'user-management',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true, breadcrumb: '用户管理' },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '数据看板', requiresAuth: true, requiresAdmin: true, breadcrumb: '数据看板' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true, breadcrumb: '个人中心' },
      },
      {
        path: 'system-settings',
        name: 'system-settings',
        component: () => import('@/views/SystemSettings.vue'),
        meta: { title: '系统设置', requiresAuth: true, breadcrumb: '系统设置' },
      },
      {
        path: 'statistics',
        name: 'statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '统计报表', requiresAuth: true, requiresAdmin: true, breadcrumb: '统计报表' },
      },
    ],
  },
  {
    path: '/404',
    name: 'notFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.title) {
    document.title = `${to.meta.title} - 个人工作管理系统`
  }

  if (to.path === '/login') {
    next()
    return
  }

  if (to.path === '/404') {
    next()
    return
  }

  if (!userStore.token) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }

  next()
})

export default router