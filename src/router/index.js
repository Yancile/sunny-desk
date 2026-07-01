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
        meta: { title: '首页', requiresAuth: true, breadcrumb: '首页' },
      },
      {
        path: 'user-management',
        name: 'user-management',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true, breadcrumb: '用户管理' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人信息', requiresAuth: true, breadcrumb: '个人信息' },
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
        meta: { title: '统计报表', requiresAuth: true, breadcrumb: '统计报表' },
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

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 个人后台管理系统`
  }

  // 如果访问登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 如果访问404页面，直接放行
  if (to.path === '/404') {
    next()
    return
  }

  // 检查是否已登录
  if (!userStore.token) {
    next('/login')
    return
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }

  next()
})

export default router