import VueRouter from 'vue-router'
import Layout from '@/views/Layout.vue'

const Login = () => import('@/views/login/Login.vue')
const Dashboard = () => import('@/views/dashboard/index.vue')
const Equipment = () => import('@/views/equipment/index.vue')
const Inspection = () => import('@/views/inspection/index.vue')
const Hazard = () => import('@/views/hazard/index.vue')
const Maintenance = () => import('@/views/maintenance/index.vue')
const Warning = () => import('@/views/warning/index.vue')
const Statistics = () => import('@/views/statistics/index.vue')
const User = () => import('@/views/user/index.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { title: '仪表盘' } },
      { path: 'equipment', name: 'Equipment', component: Equipment, meta: { title: '器材管理' } },
      { path: 'inspection', name: 'Inspection', component: Inspection, meta: { title: '巡检管理' } },
      { path: 'hazard', name: 'Hazard', component: Hazard, meta: { title: '隐患管理' } },
      { path: 'maintenance', name: 'Maintenance', component: Maintenance, meta: { title: '维保管理' } },
      { path: 'warning', name: 'Warning', component: Warning, meta: { title: '预警管理' } },
      { path: 'statistics', name: 'Statistics', component: Statistics, meta: { title: '统计报表' } },
      { path: 'user', name: 'User', component: User, meta: { title: '用户管理' } }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.public) {
    // Logged-in users don't need to see login page
    if (to.name === 'Login' && token) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title + ' - 消防器材管理系统'
  }
})

export default router
